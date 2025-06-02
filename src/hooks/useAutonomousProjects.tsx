
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Epic {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  priority: number;
  estimated_hours: number;
  actual_hours: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  epic_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'done' | 'blocked' | 'cancelled';
  priority: number;
  estimated_hours: number;
  actual_hours: number;
  due_date?: string;
  completion_percentage: number;
  assigned_to?: string;
  owner: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  task_id?: string;
  decision_type: 'task_prioritization' | 'resource_allocation' | 'deadline_adjustment' | 'task_decomposition' | 'risk_mitigation';
  context: Record<string, any>;
  options: any[];
  selected_option?: string;
  rationale?: string;
  confidence_score: number;
  impact_assessment: Record<string, any>;
  approved_by_user: boolean;
  approved_at?: string;
  executed: boolean;
  executed_at?: string;
  outcome_quality?: number;
  created_at: string;
}

export interface CognitiveAlert {
  id: string;
  user_id: string;
  alert_type: 'deadline_risk' | 'task_blocked' | 'resource_conflict' | 'pattern_detected' | 'optimization_suggested';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  related_task_id?: string;
  related_project_id?: string;
  metadata: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

// Helper function to safely cast status values
function castEpicStatus(status: string): Epic['status'] {
  const validStatuses: Epic['status'][] = ['planning', 'active', 'completed', 'archived'];
  return validStatuses.includes(status as Epic['status']) ? status as Epic['status'] : 'planning';
}

function castTaskStatus(status: string): Task['status'] {
  const validStatuses: Task['status'][] = ['pending', 'in_progress', 'done', 'blocked', 'cancelled'];
  return validStatuses.includes(status as Task['status']) ? status as Task['status'] : 'pending';
}

function castDecisionType(type: string): Decision['decision_type'] {
  const validTypes: Decision['decision_type'][] = ['task_prioritization', 'resource_allocation', 'deadline_adjustment', 'task_decomposition', 'risk_mitigation'];
  return validTypes.includes(type as Decision['decision_type']) ? type as Decision['decision_type'] : 'task_prioritization';
}

function castAlertType(type: string): CognitiveAlert['alert_type'] {
  const validTypes: CognitiveAlert['alert_type'][] = ['deadline_risk', 'task_blocked', 'resource_conflict', 'pattern_detected', 'optimization_suggested'];
  return validTypes.includes(type as CognitiveAlert['alert_type']) ? type as CognitiveAlert['alert_type'] : 'deadline_risk';
}

function castAlertSeverity(severity: string): CognitiveAlert['severity'] {
  const validSeverities: CognitiveAlert['severity'][] = ['low', 'medium', 'high', 'critical'];
  return validSeverities.includes(severity as CognitiveAlert['severity']) ? severity as CognitiveAlert['severity'] : 'medium';
}

function castAlertStatus(status: string): CognitiveAlert['status'] {
  const validStatuses: CognitiveAlert['status'][] = ['active', 'acknowledged', 'resolved', 'dismissed'];
  return validStatuses.includes(status as CognitiveAlert['status']) ? status as CognitiveAlert['status'] : 'active';
}

// Helper function to safely cast Json to Record<string, any>
function safeJsonCast(json: any): Record<string, any> {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    return json as Record<string, any>;
  }
  return {};
}

// Helper function to safely cast Json to array
function safeArrayCast(json: any): any[] {
  if (Array.isArray(json)) {
    return json;
  }
  return [];
}

export function useAutonomousProjects() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [alerts, setAlerts] = useState<CognitiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEpics = async (projectId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('epics')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching epics:', error);
        toast({
          title: "Erro ao carregar épicos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchEpics:', error);
      toast({
        title: "Erro ao carregar épicos",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchTasks = async (epicId?: string) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (epicId) {
        query = query.eq('epic_id', epicId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Erro ao carregar tarefas",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      toast({
        title: "Erro ao carregar tarefas",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return [];
    }
  };

  const createEpic = async (projectId: string, epicData: Partial<Epic>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('epics')
        .insert({
          project_id: projectId,
          name: epicData.name,
          description: epicData.description,
          status: epicData.status || 'planning',
          priority: epicData.priority || 1,
          estimated_hours: epicData.estimated_hours || 0,
          start_date: epicData.start_date,
          end_date: epicData.end_date,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating epic:', error);
        toast({
          title: "Erro ao criar épico",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Cast the data to Epic type with proper status casting
      const newEpic: Epic = {
        ...data,
        status: castEpicStatus(data.status)
      };

      setEpics(prev => [newEpic, ...prev]);
      toast({
        title: "Épico criado com sucesso",
        description: `O épico "${epicData.name}" foi criado.`,
      });
      return true;
    } catch (error) {
      console.error('Error in createEpic:', error);
      toast({
        title: "Erro ao criar épico",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          epic_id: taskData.epic_id,
          parent_task_id: taskData.parent_task_id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'pending',
          priority: taskData.priority || 1,
          estimated_hours: taskData.estimated_hours || 0,
          due_date: taskData.due_date,
          completion_percentage: taskData.completion_percentage || 0,
          assigned_to: taskData.assigned_to,
          owner: user.id,
          tags: taskData.tags || [],
          metadata: taskData.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: "Erro ao criar tarefa",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Cast the data to Task type with proper status casting and metadata handling
      const newTask: Task = {
        ...data,
        status: castTaskStatus(data.status),
        tags: data.tags || [],
        metadata: safeJsonCast(data.metadata)
      };

      setTasks(prev => [newTask, ...prev]);
      toast({
        title: "Tarefa criada com sucesso",
        description: `A tarefa "${taskData.title}" foi criada.`,
      });
      return true;
    } catch (error) {
      console.error('Error in createTask:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task status:', error);
        toast({
          title: "Erro ao atualizar tarefa",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      ));

      toast({
        title: "Status atualizado",
        description: `Tarefa marcada como ${status}.`,
      });
      return true;
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchDecisions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching decisions:', error);
        return;
      }

      // Cast the data with proper type casting
      const typedDecisions: Decision[] = (data || []).map(item => ({
        ...item,
        decision_type: castDecisionType(item.decision_type),
        context: safeJsonCast(item.context),
        options: safeArrayCast(item.options),
        impact_assessment: safeJsonCast(item.impact_assessment)
      }));

      setDecisions(typedDecisions);
    } catch (error) {
      console.error('Error in fetchDecisions:', error);
    }
  };

  const approveDecision = async (decisionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('decisions')
        .update({ 
          approved_by_user: true, 
          approved_at: new Date().toISOString() 
        })
        .eq('id', decisionId);

      if (error) {
        console.error('Error approving decision:', error);
        toast({
          title: "Erro ao aprovar decisão",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setDecisions(prev => prev.map(decision => 
        decision.id === decisionId 
          ? { ...decision, approved_by_user: true, approved_at: new Date().toISOString() }
          : decision
      ));

      toast({
        title: "Decisão aprovada",
        description: "A decisão autônoma foi aprovada com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error in approveDecision:', error);
      return false;
    }
  };

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cognitive_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      // Cast the data with proper type casting
      const typedAlerts: CognitiveAlert[] = (data || []).map(item => ({
        ...item,
        alert_type: castAlertType(item.alert_type),
        severity: castAlertSeverity(item.severity),
        status: castAlertStatus(item.status),
        metadata: safeJsonCast(item.metadata)
      }));

      setAlerts(typedAlerts);
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cognitive_alerts')
        .update({ 
          status: 'acknowledged', 
          acknowledged_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error acknowledging alert:', error);
        return false;
      }

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      return true;
    } catch (error) {
      console.error('Error in acknowledgeAlert:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDecisions();
      fetchAlerts();
    }
  }, [user]);

  return {
    epics,
    tasks,
    decisions,
    alerts,
    loading,
    setEpics,
    setTasks,
    fetchEpics,
    fetchTasks,
    createEpic,
    createTask,
    updateTaskStatus,
    approveDecision,
    acknowledgeAlert,
    refetchDecisions: fetchDecisions,
    refetchAlerts: fetchAlerts,
  };
}

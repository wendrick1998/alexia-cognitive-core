
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface PriorityFactors {
  urgency: number;          // 0-1 baseado em deadline
  importance: number;       // 0-1 baseado em impacto
  effort: number;          // 0-1 baseado em estimativa (invertido)
  dependencies: number;     // 0-1 baseado em bloqueios
  strategic_value: number; // 0-1 baseado em objetivos
}

export interface TaskPriority {
  task_id: string;
  calculated_priority: number;
  priority_factors: PriorityFactors;
  recommendation: 'urgent' | 'important' | 'delegate' | 'eliminate';
  reasoning: string;
  last_calculated: string;
}

export function useIntelligentPrioritization() {
  const { user } = useAuth();
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateTaskPriority = useCallback(async (taskId: string): Promise<TaskPriority | null> => {
    if (!user) return null;

    try {
      // Buscar dados da tarefa
      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          *,
          epics(priority, estimated_hours, projects(priority))
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;

      // Calcular fatores de prioridade
      const factors = await calculatePriorityFactors(task);
      
      // Calcular prioridade final usando algoritmo ponderado
      const calculated_priority = calculateFinalPriority(factors);
      
      // Determinar recomendação baseada na matriz Eisenhower
      const recommendation = determineRecommendation(factors);
      
      // Gerar raciocínio explicativo
      const reasoning = generateReasoning(factors, task);

      const taskPriority: TaskPriority = {
        task_id: taskId,
        calculated_priority,
        priority_factors: factors,
        recommendation,
        reasoning,
        last_calculated: new Date().toISOString()
      };

      return taskPriority;

    } catch (error) {
      console.error('Erro ao calcular prioridade:', error);
      return null;
    }
  }, [user]);

  const recalculateAllPriorities = useCallback(async (projectId?: string) => {
    if (!user || isCalculating) return;

    setIsCalculating(true);
    try {
      console.log('🧮 Recalculando prioridades...');

      // Buscar tarefas ativas
      let query = supabase
        .from('tasks')
        .select('id')
        .neq('status', 'done')
        .neq('status', 'cancelled');

      if (projectId) {
        query = query.eq('epics.project_id', projectId);
      }

      const { data: tasks, error } = await query;
      if (error) throw error;

      const newPriorities: TaskPriority[] = [];

      // Calcular prioridade para cada tarefa
      for (const task of tasks || []) {
        const priority = await calculateTaskPriority(task.id);
        if (priority) {
          newPriorities.push(priority);
        }
      }

      // Ordenar por prioridade calculada
      newPriorities.sort((a, b) => b.calculated_priority - a.calculated_priority);

      setPriorities(newPriorities);

      console.log('✅ Prioridades recalculadas:', newPriorities.length);

    } catch (error) {
      console.error('Erro ao recalcular prioridades:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [user, isCalculating, calculateTaskPriority]);

  const getPriorityForTask = useCallback((taskId: string) => {
    return priorities.find(p => p.task_id === taskId);
  }, [priorities]);

  const getTopPriorityTasks = useCallback((limit: number = 10) => {
    return priorities.slice(0, limit);
  }, [priorities]);

  const getTasksByRecommendation = useCallback((recommendation: TaskPriority['recommendation']) => {
    return priorities.filter(p => p.recommendation === recommendation);
  }, [priorities]);

  // Recalcular automaticamente a cada 30 minutos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      recalculateAllPriorities();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, recalculateAllPriorities]);

  return {
    priorities,
    isCalculating,
    calculateTaskPriority,
    recalculateAllPriorities,
    getPriorityForTask,
    getTopPriorityTasks,
    getTasksByRecommendation
  };
}

// Funções auxiliares para cálculo de prioridade
async function calculatePriorityFactors(task: any): Promise<PriorityFactors> {
  // 1. Urgência baseada em deadline
  const urgency = calculateUrgency(task.due_date);
  
  // 2. Importância baseada em prioridade manual e projeto
  const importance = calculateImportance(task.priority, task.epics?.priority, task.epics?.projects?.priority);
  
  // 3. Esforço (invertido - menos esforço = maior prioridade)
  const effort = calculateEffort(task.estimated_hours);
  
  // 4. Dependências (tarefas que bloqueiam outras têm maior prioridade)
  const dependencies = await calculateDependencyImpact(task.id);
  
  // 5. Valor estratégico baseado em tags e contexto
  const strategic_value = calculateStrategicValue(task.tags, task.description);

  return {
    urgency,
    importance,
    effort,
    dependencies,
    strategic_value
  };
}

function calculateUrgency(dueDate?: string): number {
  if (!dueDate) return 0.3; // Sem deadline = baixa urgência

  const now = new Date();
  const deadline = new Date(dueDate);
  const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (daysUntilDeadline <= 0) return 1.0; // Atrasado
  if (daysUntilDeadline <= 1) return 0.9; // Menos de 1 dia
  if (daysUntilDeadline <= 3) return 0.8; // Menos de 3 dias
  if (daysUntilDeadline <= 7) return 0.6; // Menos de 1 semana
  if (daysUntilDeadline <= 30) return 0.4; // Menos de 1 mês
  
  return 0.2; // Mais de 1 mês
}

function calculateImportance(taskPriority: number, epicPriority?: number, projectPriority?: number): number {
  // Normalizar prioridades (assumindo escala 1-10)
  const taskWeight = (taskPriority || 1) / 10;
  const epicWeight = (epicPriority || 1) / 10;
  const projectWeight = (projectPriority || 1) / 10;

  // Média ponderada (tarefa tem mais peso)
  return (taskWeight * 0.5 + epicWeight * 0.3 + projectWeight * 0.2);
}

function calculateEffort(estimatedHours: number): number {
  // Inverter o esforço (menos horas = maior prioridade para quick wins)
  if (estimatedHours <= 1) return 1.0;
  if (estimatedHours <= 4) return 0.8;
  if (estimatedHours <= 8) return 0.6;
  if (estimatedHours <= 16) return 0.4;
  if (estimatedHours <= 40) return 0.2;
  
  return 0.1; // Muito trabalhoso
}

async function calculateDependencyImpact(taskId: string): Promise<number> {
  // Buscar quantas tarefas dependem desta
  const { data: dependentTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('parent_task_id', taskId);

  const dependentCount = dependentTasks?.length || 0;
  
  // Mais dependentes = maior impacto
  if (dependentCount >= 5) return 1.0;
  if (dependentCount >= 3) return 0.8;
  if (dependentCount >= 1) return 0.6;
  
  return 0.3; // Sem dependentes
}

function calculateStrategicValue(tags: string[], description?: string): number {
  let value = 0.5; // Valor base

  // Tags estratégicas
  const strategicTags = ['critical', 'revenue', 'customer', 'security', 'performance'];
  const hasStrategicTags = tags?.some(tag => strategicTags.includes(tag.toLowerCase()));
  
  if (hasStrategicTags) value += 0.3;

  // Palavras-chave na descrição
  const strategicKeywords = ['customer', 'revenue', 'critical', 'urgent', 'security'];
  const hasStrategicKeywords = strategicKeywords.some(keyword => 
    description?.toLowerCase().includes(keyword)
  );
  
  if (hasStrategicKeywords) value += 0.2;

  return Math.min(1.0, value);
}

function calculateFinalPriority(factors: PriorityFactors): number {
  // Pesos para cada fator
  const weights = {
    urgency: 0.25,
    importance: 0.30,
    effort: 0.15,
    dependencies: 0.15,
    strategic_value: 0.15
  };

  return (
    factors.urgency * weights.urgency +
    factors.importance * weights.importance +
    factors.effort * weights.effort +
    factors.dependencies * weights.dependencies +
    factors.strategic_value * weights.strategic_value
  );
}

function determineRecommendation(factors: PriorityFactors): TaskPriority['recommendation'] {
  // Matriz de Eisenhower adaptada
  if (factors.urgency > 0.7 && factors.importance > 0.7) return 'urgent';
  if (factors.urgency < 0.4 && factors.importance > 0.7) return 'important';
  if (factors.urgency > 0.7 && factors.importance < 0.4) return 'delegate';
  return 'eliminate';
}

function generateReasoning(factors: PriorityFactors, task: any): string {
  const reasons = [];
  
  if (factors.urgency > 0.8) reasons.push('deadline próximo');
  if (factors.importance > 0.8) reasons.push('alta importância estratégica');
  if (factors.effort > 0.8) reasons.push('baixo esforço (quick win)');
  if (factors.dependencies > 0.7) reasons.push('bloqueia outras tarefas');
  if (factors.strategic_value > 0.7) reasons.push('alto valor estratégico');

  return reasons.length > 0 
    ? `Priorizada devido a: ${reasons.join(', ')}`
    : 'Prioridade padrão baseada em fatores equilibrados';
}

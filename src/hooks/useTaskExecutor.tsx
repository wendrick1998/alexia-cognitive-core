
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface TaskExecution {
  id: string;
  task_id: string;
  execution_type: 'automated' | 'manual' | 'hybrid';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'requires_approval';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  execution_logs: ExecutionLog[];
  external_integrations: ExternalIntegration[];
  validation_points: ValidationPoint[];
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

export interface ExternalIntegration {
  type: 'github' | 'ci_cd' | 'api' | 'webhook';
  status: 'idle' | 'connecting' | 'active' | 'error';
  last_sync?: string;
  config: Record<string, any>;
}

export interface ValidationPoint {
  id: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  required_approval: boolean;
  auto_approve_threshold?: number;
}

export function useTaskExecutor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const startTaskExecution = useCallback(async (
    taskId: string, 
    executionType: TaskExecution['execution_type'] = 'automated'
  ) => {
    if (!user || isExecuting) return null;

    setIsExecuting(true);
    try {
      console.log('🚀 Iniciando execução de tarefa:', taskId);

      // Criar nova execução
      const newExecution: TaskExecution = {
        id: crypto.randomUUID(),
        task_id: taskId,
        execution_type: executionType,
        status: 'pending',
        progress_percentage: 0,
        started_at: new Date().toISOString(),
        execution_logs: [{
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Execução iniciada',
          data: { taskId, executionType }
        }],
        external_integrations: [],
        validation_points: []
      };

      // Buscar detalhes da tarefa
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*, epics(name, project_id, projects(name))')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      // Analisar dependências
      const dependencies = await analyzeDependencies(taskId);
      
      // Configurar integrações externas baseadas na tarefa
      const integrations = await setupExternalIntegrations(task);
      newExecution.external_integrations = integrations;

      // Definir pontos de validação
      const validationPoints = await defineValidationPoints(task);
      newExecution.validation_points = validationPoints;

      // Iniciar execução automática
      newExecution.status = 'running';
      setExecutions(prev => [...prev, newExecution]);

      // Executar tarefa em background
      executeTaskSteps(newExecution, task, dependencies);

      toast({
        title: "Execução Iniciada",
        description: `Tarefa "${task.title}" em execução autônoma`,
      });

      return newExecution.id;

    } catch (error) {
      console.error('❌ Erro ao iniciar execução:', error);
      toast({
        title: "Erro na Execução",
        description: "Falha ao iniciar execução autônoma",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [user, isExecuting, toast]);

  const pauseExecution = useCallback(async (executionId: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId 
        ? { 
            ...exec, 
            status: 'paused',
            execution_logs: [...exec.execution_logs, {
              timestamp: new Date().toISOString(),
              level: 'warning',
              message: 'Execução pausada pelo usuário'
            }]
          }
        : exec
    ));
  }, []);

  const resumeExecution = useCallback(async (executionId: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId 
        ? { 
            ...exec, 
            status: 'running',
            execution_logs: [...exec.execution_logs, {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: 'Execução retomada'
            }]
          }
        : exec
    ));
  }, []);

  const approveValidation = useCallback(async (executionId: string, validationId: string) => {
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId 
        ? {
            ...exec,
            validation_points: exec.validation_points.map(vp =>
              vp.id === validationId ? { ...vp, status: 'approved' } : vp
            ),
            status: 'running'
          }
        : exec
    ));
  }, []);

  const getExecutionById = useCallback((executionId: string) => {
    return executions.find(exec => exec.id === executionId);
  }, [executions]);

  return {
    executions,
    isExecuting,
    startTaskExecution,
    pauseExecution,
    resumeExecution,
    approveValidation,
    getExecutionById
  };
}

// Funções auxiliares
async function analyzeDependencies(taskId: string) {
  const { data: dependencies } = await supabase
    .from('tasks')
    .select('id, title, status, completion_percentage')
    .eq('parent_task_id', taskId);
  
  return dependencies || [];
}

async function setupExternalIntegrations(task: any): Promise<ExternalIntegration[]> {
  const integrations: ExternalIntegration[] = [];
  
  // Detectar se precisa de integração GitHub
  if (task.tags?.includes('development') || task.description?.includes('github')) {
    integrations.push({
      type: 'github',
      status: 'idle',
      config: {
        repository: extractGitHubRepo(task.description),
        branch: 'main'
      }
    });
  }

  // Detectar se precisa de CI/CD
  if (task.tags?.includes('deployment') || task.description?.includes('deploy')) {
    integrations.push({
      type: 'ci_cd',
      status: 'idle',
      config: {
        pipeline: 'main',
        environment: 'staging'
      }
    });
  }

  return integrations;
}

async function defineValidationPoints(task: any): Promise<ValidationPoint[]> {
  const points: ValidationPoint[] = [];
  
  // Validação para tarefas de alta prioridade
  if (task.priority >= 8) {
    points.push({
      id: crypto.randomUUID(),
      description: 'Aprovação para tarefa de alta prioridade',
      status: 'pending',
      required_approval: true
    });
  }

  // Validação para tarefas com impacto em produção
  if (task.tags?.includes('production')) {
    points.push({
      id: crypto.randomUUID(),
      description: 'Validação para alteração em produção',
      status: 'pending',
      required_approval: true
    });
  }

  return points;
}

async function executeTaskSteps(execution: TaskExecution, task: any, dependencies: any[]) {
  // Simulação de execução em steps
  const steps = [
    'Análise de dependências',
    'Preparação do ambiente',
    'Execução principal',
    'Testes de validação',
    'Finalização'
  ];

  for (let i = 0; i < steps.length; i++) {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const progress = ((i + 1) / steps.length) * 100;
    
    // Atualizar progresso (em implementação real, isso seria via websockets ou polling)
    console.log(`📊 Progresso: ${progress}% - ${steps[i]}`);
  }
}

function extractGitHubRepo(description: string): string | null {
  const githubRegex = /github\.com\/([^\/]+\/[^\/\s]+)/;
  const match = description?.match(githubRegex);
  return match ? match[1] : null;
}

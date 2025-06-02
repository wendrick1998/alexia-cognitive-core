
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAutonomousProjects, Task, Epic, Decision } from '@/hooks/useAutonomousProjects';
import { useTaskExecutor } from '@/hooks/useTaskExecutor';
import { useIntelligentPrioritization } from '@/hooks/useIntelligentPrioritization';

export interface TaskFrameworkState {
  activeTask: Task | null;
  executionQueue: Task[];
  autonomousMode: boolean;
  humanApprovalRequired: boolean;
  currentDecision: Decision | null;
}

export interface TaskExecution {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'requires_approval';
  progress: number;
  estimatedCompletion: Date | null;
  dependencies: string[];
  blockedBy: string[];
}

export function useAutonomousTaskFramework() {
  const { user } = useAuth();
  const { toast } = useToast();
  const autonomousProjects = useAutonomousProjects();
  const taskExecutor = useTaskExecutor();
  const prioritization = useIntelligentPrioritization();

  const [frameworkState, setFrameworkState] = useState<TaskFrameworkState>({
    activeTask: null,
    executionQueue: [],
    autonomousMode: false,
    humanApprovalRequired: false,
    currentDecision: null
  });

  const [executions, setExecutions] = useState<Map<string, TaskExecution>>(new Map());

  // Inicializar sistema autônomo
  const initializeAutonomousMode = useCallback(async () => {
    if (!user) return;

    console.log('🤖 Inicializando modo autônomo...');
    
    try {
      // Recalcular prioridades
      await prioritization.recalculateAllPriorities();
      
      // Buscar tarefas de alta prioridade
      const highPriorityTasks = prioritization.getTopPriorityTasks(5);
      
      setFrameworkState(prev => ({
        ...prev,
        autonomousMode: true,
        executionQueue: highPriorityTasks.map(p => 
          autonomousProjects.tasks.find(t => t.id === p.task_id)!
        ).filter(Boolean)
      }));

      toast({
        title: "Modo Autônomo Ativado",
        description: `${highPriorityTasks.length} tarefas na fila de execução`,
      });

    } catch (error) {
      console.error('❌ Erro ao inicializar modo autônomo:', error);
      toast({
        title: "Erro",
        description: "Falha ao ativar modo autônomo",
        variant: "destructive",
      });
    }
  }, [user, prioritization, autonomousProjects.tasks, toast]);

  // Executar próxima tarefa na fila
  const executeNextTask = useCallback(async () => {
    if (!frameworkState.autonomousMode || frameworkState.executionQueue.length === 0) {
      return;
    }

    const nextTask = frameworkState.executionQueue[0];
    
    console.log(`🚀 Executando tarefa autônoma: ${nextTask.title}`);

    // Verificar dependências
    const hasBlockingDependencies = await checkTaskDependencies(nextTask.id);
    
    if (hasBlockingDependencies) {
      console.log(`⏸️ Tarefa ${nextTask.title} bloqueada por dependências`);
      return;
    }

    // Verificar se precisa de aprovação humana
    const requiresApproval = needsHumanApproval(nextTask);
    
    if (requiresApproval) {
      setFrameworkState(prev => ({
        ...prev,
        humanApprovalRequired: true,
        activeTask: nextTask
      }));
      
      toast({
        title: "Aprovação Necessária",
        description: `Tarefa "${nextTask.title}" requer aprovação humana`,
      });
      return;
    }

    // Iniciar execução
    const executionId = await taskExecutor.startTaskExecution(nextTask.id, 'automated');
    
    if (executionId) {
      setExecutions(prev => new Map(prev.set(nextTask.id, {
        taskId: nextTask.id,
        status: 'running',
        progress: 0,
        estimatedCompletion: estimateCompletion(nextTask),
        dependencies: [],
        blockedBy: []
      })));

      setFrameworkState(prev => ({
        ...prev,
        activeTask: nextTask,
        executionQueue: prev.executionQueue.slice(1)
      }));
    }
  }, [frameworkState, taskExecutor, toast]);

  // Aprovar tarefa pendente
  const approveTask = useCallback(async (taskId: string) => {
    const task = autonomousProjects.tasks.find(t => t.id === taskId);
    if (!task) return;

    console.log(`✅ Tarefa aprovada: ${task.title}`);

    const executionId = await taskExecutor.startTaskExecution(taskId, 'manual');
    
    setFrameworkState(prev => ({
      ...prev,
      humanApprovalRequired: false,
      activeTask: task
    }));

    toast({
      title: "Tarefa Aprovada",
      description: `Executando: ${task.title}`,
    });
  }, [autonomousProjects.tasks, taskExecutor, toast]);

  // Rejeitar tarefa
  const rejectTask = useCallback(async (taskId: string, reason: string) => {
    console.log(`❌ Tarefa rejeitada: ${taskId} - ${reason}`);

    setFrameworkState(prev => ({
      ...prev,
      humanApprovalRequired: false,
      activeTask: null,
      executionQueue: prev.executionQueue.filter(t => t.id !== taskId)
    }));

    toast({
      title: "Tarefa Rejeitada",
      description: reason,
      variant: "destructive",
    });
  }, [toast]);

  // Pausar modo autônomo
  const pauseAutonomousMode = useCallback(() => {
    setFrameworkState(prev => ({
      ...prev,
      autonomousMode: false
    }));

    toast({
      title: "Modo Autônomo Pausado",
      description: "Sistema aguardando instruções manuais",
    });
  }, [toast]);

  // Auto-execução (executar automaticamente quando possível)
  useEffect(() => {
    if (frameworkState.autonomousMode && !frameworkState.humanApprovalRequired && !frameworkState.activeTask) {
      const timer = setTimeout(executeNextTask, 2000);
      return () => clearTimeout(timer);
    }
  }, [frameworkState, executeNextTask]);

  return {
    // Estado
    frameworkState,
    executions,
    
    // Controles principais
    initializeAutonomousMode,
    executeNextTask,
    approveTask,
    rejectTask,
    pauseAutonomousMode,
    
    // Dados derivados
    queueLength: frameworkState.executionQueue.length,
    isActive: frameworkState.autonomousMode,
    needsApproval: frameworkState.humanApprovalRequired,
    
    // Hooks subjacentes
    autonomousProjects,
    taskExecutor,
    prioritization
  };
}

// Funções auxiliares
async function checkTaskDependencies(taskId: string): Promise<boolean> {
  // Implementar verificação de dependências
  return false;
}

function needsHumanApproval(task: Task): boolean {
  // Tarefas de alta prioridade ou com tags críticas precisam de aprovação
  return task.priority >= 8 || task.tags.includes('critical') || task.tags.includes('production');
}

function estimateCompletion(task: Task): Date | null {
  if (!task.estimated_hours) return null;
  
  const now = new Date();
  const estimatedMs = task.estimated_hours * 60 * 60 * 1000; // horas para ms
  return new Date(now.getTime() + estimatedMs);
}

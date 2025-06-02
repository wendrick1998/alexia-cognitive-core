
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Brain,
  Zap,
  Settings
} from 'lucide-react';
import { useAutonomousTaskFramework } from '@/hooks/useAutonomousTaskFramework';

const TaskFrameworkDashboard = () => {
  const {
    frameworkState,
    executions,
    initializeAutonomousMode,
    executeNextTask,
    approveTask,
    rejectTask,
    pauseAutonomousMode,
    queueLength,
    isActive,
    needsApproval
  } = useAutonomousTaskFramework();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'requires_approval': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Framework de Tarefas Autônomas</h2>
            <p className="text-white/60">Sistema de execução inteligente e automatizada</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={initializeAutonomousMode} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Ativar Modo Autônomo
            </Button>
          ) : (
            <Button onClick={pauseAutonomousMode} variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className={`w-6 h-6 ${isActive ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="text-sm text-white/60">Status</div>
            <div className={`font-bold ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
              {isActive ? 'Ativo' : 'Inativo'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-sm text-white/60">Na Fila</div>
            <div className="text-2xl font-bold text-blue-400">{queueLength}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className={`w-6 h-6 ${needsApproval ? 'text-yellow-400' : 'text-gray-400'}`} />
            </div>
            <div className="text-sm text-white/60">Aprovação</div>
            <div className={`font-bold ${needsApproval ? 'text-yellow-400' : 'text-gray-400'}`}>
              {needsApproval ? 'Pendente' : 'Nenhuma'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-sm text-white/60">Execuções</div>
            <div className="text-2xl font-bold text-purple-400">{executions.size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Task */}
      {frameworkState.activeTask && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Play className="w-5 h-5 text-green-400" />
              Tarefa Ativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-white">{frameworkState.activeTask.title}</h3>
              <p className="text-sm text-white/60">{frameworkState.activeTask.description}</p>
            </div>
            
            {executions.get(frameworkState.activeTask.id) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white">
                  <span>Progresso</span>
                  <span>{executions.get(frameworkState.activeTask.id)?.progress || 0}%</span>
                </div>
                <Progress 
                  value={executions.get(frameworkState.activeTask.id)?.progress || 0} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approval Required */}
      {needsApproval && frameworkState.activeTask && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              Aprovação Necessária
            </CardTitle>
            <CardDescription className="text-yellow-300/80">
              A tarefa a seguir requer aprovação humana antes da execução
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-white">{frameworkState.activeTask.title}</h3>
              <p className="text-sm text-white/60">{frameworkState.activeTask.description}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => approveTask(frameworkState.activeTask!.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button 
                onClick={() => rejectTask(frameworkState.activeTask!.id, 'Rejeitada pelo usuário')}
                variant="destructive"
              >
                Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Queue */}
      {queueLength > 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Fila de Execução</CardTitle>
            <CardDescription className="text-white/60">
              Próximas tarefas a serem executadas automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {frameworkState.executionQueue.slice(0, 5).map((task, index) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="text-sm text-white/60">
                        {task.estimated_hours}h estimadas • Prioridade {task.priority}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {task.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              {queueLength > 5 && (
                <div className="text-center text-sm text-white/60">
                  +{queueLength - 5} tarefas adicionais na fila
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" onClick={executeNextTask} disabled={!isActive || queueLength === 0}>
              <Play className="w-4 h-4 mr-2" />
              Executar Próxima
            </Button>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Ver Histórico
            </Button>
            <Button variant="outline">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Gerenciar Alertas
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskFrameworkDashboard;

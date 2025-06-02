
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Zap,
  GitBranch,
  Settings,
  Activity,
  Eye
} from 'lucide-react';
import { useTaskExecutor } from '@/hooks/useTaskExecutor';
import { useIntelligentPrioritization } from '@/hooks/useIntelligentPrioritization';
import { cn } from '@/lib/utils';

const ExecutionDashboard = () => {
  const { 
    executions, 
    isExecuting, 
    startTaskExecution, 
    pauseExecution, 
    resumeExecution,
    approveValidation 
  } = useTaskExecutor();
  
  const { 
    priorities, 
    isCalculating, 
    getTopPriorityTasks,
    recalculateAllPriorities 
  } = useIntelligentPrioritization();

  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  useEffect(() => {
    // Carregar prioridades ao montar
    recalculateAllPriorities();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'requires_approval': return <Eye className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'requires_approval': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 0.8) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 0.6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const activeExecutions = executions.filter(e => ['running', 'paused', 'requires_approval'].includes(e.status));
  const completedExecutions = executions.filter(e => ['completed', 'failed'].includes(e.status));
  const topPriorityTasks = getTopPriorityTasks(10);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Execução Autônoma de Tarefas
          </h1>
          <p className="text-gray-600 mt-1">Monitoramento e controle de execuções automatizadas</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => recalculateAllPriorities()}
            disabled={isCalculating}
            variant="outline"
          >
            {isCalculating ? <Activity className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
            Recalcular Prioridades
          </Button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções Ativas</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeExecutions.length}</div>
            <p className="text-xs text-muted-foreground">
              {executions.filter(e => e.status === 'running').length} em execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executions.length > 0 
                ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {executions.filter(e => e.status === 'completed').length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes Aprovação</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executions.filter(e => e.status === 'requires_approval').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando validação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Priorizadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topPriorityTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Calculadas automaticamente
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Execuções Ativas</TabsTrigger>
          <TabsTrigger value="priorities">Prioridades</TabsTrigger>
          <TabsTrigger value="completed">Histórico</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeExecutions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma Execução Ativa</h3>
              <p className="text-gray-600">
                As execuções autônomas aparecerão aqui quando iniciadas.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeExecutions.map((execution) => (
                <Card key={execution.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          Tarefa {execution.task_id.slice(0, 8)}...
                        </CardTitle>
                        <CardDescription>
                          Tipo: {execution.execution_type} • Iniciado em{' '}
                          {new Date(execution.started_at!).toLocaleTimeString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge className={cn("ml-2", getStatusColor(execution.status))}>
                        {execution.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progresso</span>
                          <span>{execution.progress_percentage}%</span>
                        </div>
                        <Progress value={execution.progress_percentage} className="h-2" />
                      </div>

                      {/* Pontos de Validação */}
                      {execution.validation_points.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Validações:</h4>
                          {execution.validation_points.map((point) => (
                            <div key={point.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{point.description}</span>
                              {point.status === 'pending' && point.required_approval && (
                                <Button
                                  size="sm"
                                  onClick={() => approveValidation(execution.id, point.id)}
                                >
                                  Aprovar
                                </Button>
                              )}
                              {point.status === 'approved' && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Controles */}
                      <div className="flex gap-2">
                        {execution.status === 'running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pauseExecution(execution.id)}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pausar
                          </Button>
                        )}
                        {execution.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => resumeExecution(execution.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Retomar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedExecution(execution.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                      </div>

                      {/* Logs Recentes */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Logs Recentes:</h4>
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {execution.execution_logs.slice(-3).map((log, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className="text-gray-400">
                                  {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                                </span>
                                <span className={cn(
                                  log.level === 'error' && 'text-red-600',
                                  log.level === 'warning' && 'text-yellow-600',
                                  log.level === 'success' && 'text-green-600'
                                )}>
                                  {log.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="priorities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Priorizadas Automaticamente</CardTitle>
              <CardDescription>
                Sistema de priorização inteligente baseado em múltiplos fatores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topPriorityTasks.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  Nenhuma tarefa priorizada encontrada
                </p>
              ) : (
                <div className="space-y-3">
                  {topPriorityTasks.map((priority, index) => (
                    <div key={priority.task_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">Tarefa {priority.task_id.slice(0, 8)}...</div>
                          <div className="text-sm text-gray-600">{priority.reasoning}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(priority.calculated_priority)}>
                          {Math.round(priority.calculated_priority * 100)}% prioridade
                        </Badge>
                        <Badge variant="outline">
                          {priority.recommendation}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => startTaskExecution(priority.task_id)}
                          disabled={isExecuting}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Executar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedExecutions.map((execution) => (
              <Card key={execution.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      Tarefa {execution.task_id.slice(0, 8)}...
                    </CardTitle>
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Iniciado: {new Date(execution.started_at!).toLocaleString('pt-BR')}
                      {execution.completed_at && (
                        <> • Concluído: {new Date(execution.completed_at).toLocaleString('pt-BR')}</>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{execution.progress_percentage}%</div>
                      <div className="text-xs text-gray-500">
                        {execution.execution_logs.length} logs
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Integrações Externas
              </CardTitle>
              <CardDescription>
                Configuração e status das integrações com ferramentas externas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">GitHub Integration</div>
                      <div className="text-sm text-gray-600">Automação de commits e PRs</div>
                    </div>
                  </div>
                  <Badge variant="outline">Configurar</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">CI/CD Pipeline</div>
                      <div className="text-sm text-gray-600">Deploy automático</div>
                    </div>
                  </div>
                  <Badge variant="outline">Configurar</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Webhooks</div>
                      <div className="text-sm text-gray-600">Notificações automáticas</div>
                    </div>
                  </div>
                  <Badge variant="outline">Configurar</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutionDashboard;

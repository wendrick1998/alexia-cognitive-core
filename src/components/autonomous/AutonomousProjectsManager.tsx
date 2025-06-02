import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAutonomousProjects } from '@/hooks/useAutonomousProjects';
import { useProjects } from '@/hooks/useProjects';
import { Brain, CheckCircle, Clock, AlertTriangle, Plus, Calendar, Users, Target, Lightbulb } from 'lucide-react';
import ExecutionDashboard from './ExecutionDashboard';
import PersonalizedCoaching from '../learning/PersonalizedCoaching';
import ProcessOptimization from '../learning/ProcessOptimization';

const AutonomousProjectsManager = () => {
  const { projects } = useProjects();
  const {
    epics,
    tasks,
    decisions,
    alerts,
    createEpic,
    createTask,
    updateTaskStatus,
    approveDecision,
    acknowledgeAlert,
    fetchEpics,
    fetchTasks
  } = useAutonomousProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [epicFormData, setEpicFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    priority: 1,
    estimated_hours: 0,
  });
  const [taskFormData, setTaskFormData] = useState({
    epic_id: '',
    title: '',
    description: '',
    status: 'pending' as const,
    priority: 1,
    estimated_hours: 0,
    due_date: '',
  });

  useEffect(() => {
    if (selectedProjectId) {
      fetchEpics(selectedProjectId);
      fetchTasks();
    }
  }, [selectedProjectId]);

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !epicFormData.name.trim()) return;

    const success = await createEpic(selectedProjectId, epicFormData);
    if (success) {
      setEpicFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 1,
        estimated_hours: 0,
      });
      setIsCreateEpicOpen(false);
      fetchEpics(selectedProjectId);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    const success = await createTask(taskFormData);
    if (success) {
      setTaskFormData({
        epic_id: '',
        title: '',
        description: '',
        status: 'pending',
        priority: 1,
        estimated_hours: 0,
        due_date: '',
      });
      setIsCreateTaskOpen(false);
      fetchTasks();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'active':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'planning':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Gestão Autônoma de Projetos
          </h1>
          <p className="text-gray-600 mt-1">Sistema inteligente de planejamento e execução de tarefas</p>
        </div>
        
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProjectId && (
        <Card className="p-8 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Selecione um Projeto</h3>
          <p className="text-gray-600">
            Escolha um projeto para começar a usar o sistema de gestão autônoma.
          </p>
        </Card>
      )}

      {selectedProjectId && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="execution">Execução</TabsTrigger>
            <TabsTrigger value="coaching">Coaching</TabsTrigger>
            <TabsTrigger value="optimization">Otimização</TabsTrigger>
            <TabsTrigger value="epics">Épicos</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="decisions">Decisões</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Épicos</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{epics.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {epics.filter(e => e.status === 'active').length} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tarefas em Progresso</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tasks.filter(t => t.status === 'pending').length} pendentes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Decisões Pendentes</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {decisions.filter(d => !d.approved_by_user).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando aprovação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} críticos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso Geral</CardTitle>
                <CardDescription>
                  Acompanhe o andamento dos épicos e tarefas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {epics.map((epic) => {
                  const epicTasks = tasks.filter(t => t.epic_id === epic.id);
                  const completedTasks = epicTasks.filter(t => t.status === 'done').length;
                  const progress = epicTasks.length > 0 ? (completedTasks / epicTasks.length) * 100 : 0;

                  return (
                    <div key={epic.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{epic.name}</span>
                        <Badge className={getStatusColor(epic.status)}>
                          {epic.status}
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-gray-600">
                        {completedTasks} de {epicTasks.length} tarefas concluídas
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <ExecutionDashboard />
          </TabsContent>

          <TabsContent value="coaching" className="space-y-6">
            <PersonalizedCoaching />
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <ProcessOptimization />
          </TabsContent>

          <TabsContent value="epics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Épicos</h2>
              <Dialog open={isCreateEpicOpen} onOpenChange={setIsCreateEpicOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Épico
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateEpic}>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Épico</DialogTitle>
                      <DialogDescription>
                        Crie um épico para organizar um conjunto de tarefas relacionadas.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="epic-name">Nome do Épico *</Label>
                        <Input
                          id="epic-name"
                          value={epicFormData.name}
                          onChange={(e) => setEpicFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="epic-description">Descrição</Label>
                        <Textarea
                          id="epic-description"
                          value={epicFormData.description}
                          onChange={(e) => setEpicFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="epic-status">Status</Label>
                          <Select
                            value={epicFormData.status}
                            onValueChange={(value) => setEpicFormData(prev => ({ ...prev, status: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planning">Planejamento</SelectItem>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="archived">Arquivado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="epic-priority">Prioridade</Label>
                          <Input
                            id="epic-priority"
                            type="number"
                            min="1"
                            max="10"
                            value={epicFormData.priority}
                            onChange={(e) => setEpicFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateEpicOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Criar Épico</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {epics.map((epic) => (
                <Card key={epic.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{epic.name}</CardTitle>
                        {epic.description && (
                          <CardDescription>{epic.description}</CardDescription>
                        )}
                      </div>
                      <Badge className={getStatusColor(epic.status)}>
                        {epic.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {epic.estimated_hours}h estimadas
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Prioridade {epic.priority}
                        </span>
                      </div>
                      <span>
                        {tasks.filter(t => t.epic_id === epic.id).length} tarefas
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tarefas</h2>
              <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateTask}>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Tarefa</DialogTitle>
                      <DialogDescription>
                        Crie uma nova tarefa para ser executada no projeto.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="task-epic">Épico</Label>
                        <Select
                          value={taskFormData.epic_id}
                          onValueChange={(value) => setTaskFormData(prev => ({ ...prev, epic_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um épico" />
                          </SelectTrigger>
                          <SelectContent>
                            {epics.map((epic) => (
                              <SelectItem key={epic.id} value={epic.id}>
                                {epic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="task-title">Título da Tarefa *</Label>
                        <Input
                          id="task-title"
                          value={taskFormData.title}
                          onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="task-description">Descrição</Label>
                        <Textarea
                          id="task-description"
                          value={taskFormData.description}
                          onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="task-priority">Prioridade</Label>
                          <Input
                            id="task-priority"
                            type="number"
                            min="1"
                            max="10"
                            value={taskFormData.priority}
                            onChange={(e) => setTaskFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="task-hours">Horas Estimadas</Label>
                          <Input
                            id="task-hours"
                            type="number"
                            min="0"
                            step="0.5"
                            value={taskFormData.estimated_hours}
                            onChange={(e) => setTaskFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="task-due-date">Data de Vencimento</Label>
                        <Input
                          id="task-due-date"
                          type="date"
                          value={taskFormData.due_date}
                          onChange={(e) => setTaskFormData(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Criar Tarefa</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        {task.description && (
                          <CardDescription>{task.description}</CardDescription>
                        )}
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.estimated_hours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          P{task.priority}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {task.status !== 'done' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          >
                            Iniciar
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => updateTaskStatus(task.id, 'done')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="decisions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Decisões Autônomas</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {decisions.filter(d => !d.approved_by_user).length} pendentes
              </Badge>
            </div>

            <div className="grid gap-4">
              {decisions.map((decision) => (
                <Card key={decision.id} className={!decision.approved_by_user ? 'border-yellow-200 bg-yellow-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {decision.decision_type.replace('_', ' ')}
                        </CardTitle>
                        <CardDescription>{decision.rationale}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={decision.approved_by_user ? "default" : "secondary"}>
                          {decision.approved_by_user ? 'Aprovada' : 'Pendente'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Confiança: {Math.round(decision.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {decision.selected_option && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Opção Selecionada:</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {decision.selected_option}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(decision.created_at).toLocaleString('pt-BR')}
                      </span>
                      {!decision.approved_by_user && (
                        <Button
                          onClick={() => approveDecision(decision.id)}
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Alertas Cognitivos</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {alerts.length} ativos
              </Badge>
            </div>

            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {alert.severity === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                          {alert.severity === 'high' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                          {alert.severity === 'medium' && <Lightbulb className="w-5 h-5 text-yellow-500" />}
                          {alert.severity === 'low' && <Lightbulb className="w-5 h-5 text-blue-500" />}
                          {alert.title}
                        </CardTitle>
                        {alert.description && (
                          <CardDescription>{alert.description}</CardDescription>
                        )}
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </span>
                      <Button
                        onClick={() => acknowledgeAlert(alert.id)}
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Reconhecer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {alerts.length === 0 && (
              <Card className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum Alerta Ativo</h3>
                <p className="text-gray-600">
                  Tudo está funcionando perfeitamente! O sistema está monitorando continuamente.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AutonomousProjectsManager;

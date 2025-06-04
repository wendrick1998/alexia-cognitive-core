
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Plus, Play, Pause, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'pending';
  progress: number;
  createdAt: Date;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
}

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Implementação de Busca Semântica',
      description: 'Desenvolver sistema de busca avançado baseado em embedding vetoriais',
      status: 'active',
      progress: 75,
      createdAt: new Date('2024-01-10'),
      deadline: new Date('2024-02-15'),
      priority: 'high'
    },
    {
      id: '2',
      name: 'Otimização de Performance',
      description: 'Melhorar tempo de resposta da aplicação e reduzir uso de memória',
      status: 'paused',
      progress: 40,
      createdAt: new Date('2024-01-05'),
      deadline: new Date('2024-02-01'),
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Documentação da API',
      description: 'Criar documentação completa para todas as APIs do sistema',
      status: 'completed',
      progress: 100,
      createdAt: new Date('2023-12-20'),
      priority: 'low'
    }
  ]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium' as const
  });

  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  const handleAddProject = () => {
    if (!newProject.name.trim() || !newProject.description.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      priority: newProject.priority
    };

    setProjects(prev => [project, ...prev]);
    setNewProject({ name: '', description: '', priority: 'medium' });
    setShowNewProjectForm(false);
  };

  const handleStatusChange = (id: string, newStatus: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, status: newStatus } : project
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-500" />
          Gerenciador de Projetos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize e acompanhe seus projetos e ações cognitivas
        </p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={() => setShowNewProjectForm(!showNewProjectForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>

      {showNewProjectForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Novo Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nome do projeto"
              value={newProject.name}
              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição do projeto"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <div className="flex gap-2">
              <select
                value={newProject.priority}
                onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value as any }))}
                className="px-3 py-2 border rounded-md"
              >
                <option value="low">Baixa Prioridade</option>
                <option value="medium">Média Prioridade</option>
                <option value="high">Alta Prioridade</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProject}>
                Criar Projeto
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewProjectForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge className={getStatusColor(project.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(project.status)}
                    {project.status === 'active' ? 'Ativo' :
                     project.status === 'paused' ? 'Pausado' :
                     project.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </div>
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority === 'high' ? 'Alta' :
                   project.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progresso</span>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Criado em {project.createdAt.toLocaleDateString()}
                  {project.deadline && (
                    <div>Prazo: {project.deadline.toLocaleDateString()}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  {project.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(project.id, 'paused')}
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pausar
                    </Button>
                  )}
                  {project.status === 'paused' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(project.id, 'active')}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Retomar
                    </Button>
                  )}
                  {(project.status === 'active' || project.status === 'paused') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusChange(project.id, 'completed')}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum projeto criado ainda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectsManager;

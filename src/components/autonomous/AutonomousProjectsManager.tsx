
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FolderOpen, 
  Plus, 
  Play, 
  Pause, 
  Settings,
  Calendar,
  Users,
  BarChart3,
  CheckCircle
} from 'lucide-react';

const AutonomousProjectsManager = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const projects = [
    {
      id: 'proj-1',
      name: 'Análise Preditiva de Vendas',
      description: 'Sistema de ML para previsão de vendas baseado em dados históricos',
      status: 'active',
      progress: 75,
      team: 4,
      deadline: '2025-07-15',
      priority: 'high',
      category: 'Machine Learning'
    },
    {
      id: 'proj-2',
      name: 'Otimização de Processos',
      description: 'Automação de workflows empresariais usando IA',
      status: 'planning',
      progress: 25,
      team: 3,
      deadline: '2025-08-30',
      priority: 'medium',
      category: 'Automation'
    },
    {
      id: 'proj-3',
      name: 'Chatbot Inteligente',
      description: 'Assistant conversacional com processamento de linguagem natural',
      status: 'completed',
      progress: 100,
      team: 6,
      deadline: '2025-05-20',
      priority: 'high',
      category: 'NLP'
    },
    {
      id: 'proj-4',
      name: 'Dashboard Analytics',
      description: 'Interface de visualização de dados em tempo real',
      status: 'paused',
      progress: 60,
      team: 2,
      deadline: '2025-09-10',
      priority: 'low',
      category: 'Visualization'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-400" />;
      case 'planning': return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />;
      default: return <FolderOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  const projectStats = [
    { label: 'Total de Projetos', value: projects.length, color: 'text-blue-400' },
    { label: 'Ativos', value: projects.filter(p => p.status === 'active').length, color: 'text-green-400' },
    { label: 'Completados', value: projects.filter(p => p.status === 'completed').length, color: 'text-purple-400' },
    { label: 'Taxa de Sucesso', value: '87%', color: 'text-yellow-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Gerenciador de Projetos Autônomos</h2>
            <p className="text-white/60">Controle centralizado de todos os projetos de IA</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {projectStats.map((stat, index) => (
          <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className={`bg-white/5 backdrop-blur-sm border-white/10 cursor-pointer transition-all hover:bg-white/10 ${
              selectedProject === project.id ? 'ring-2 ring-blue-400' : ''
            }`}
            onClick={() => setSelectedProject(project.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {project.category}
                </Badge>
                <div className="flex gap-1">
                  <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Badge>
                  <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </Badge>
                </div>
              </div>
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                {getStatusIcon(project.status)}
                {project.name}
              </CardTitle>
              <CardDescription className="text-white/60 text-sm">
                {project.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white">
                  <span>Progresso</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="flex items-center justify-between text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.team} membros</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {project.status === 'active' && (
                  <Button variant="outline" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </Button>
                )}
                {(project.status === 'planning' || project.status === 'paused') && (
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatório
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Criar Template
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatório Geral
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Gerenciar Equipes
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomousProjectsManager;

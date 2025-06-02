
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  Activity, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Brain
} from 'lucide-react';

const ExecutionDashboard = () => {
  const executionTasks = [
    {
      id: 1,
      name: 'Análise de Sentimentos',
      status: 'running',
      progress: 75,
      duration: '2m 30s',
      type: 'AI Processing'
    },
    {
      id: 2,
      name: 'Processamento de Documentos',
      status: 'completed',
      progress: 100,
      duration: '1m 45s',
      type: 'Document Processing'
    },
    {
      id: 3,
      name: 'Geração de Insights',
      status: 'pending',
      progress: 0,
      duration: '0s',
      type: 'Analytics'
    },
    {
      id: 4,
      name: 'Otimização de Cache',
      status: 'error',
      progress: 30,
      duration: '45s',
      type: 'System'
    }
  ];

  const systemStats = [
    { label: 'Tarefas Ativas', value: 2, color: 'text-blue-400' },
    { label: 'Completadas Hoje', value: 15, color: 'text-green-400' },
    { label: 'Taxa de Sucesso', value: '94%', color: 'text-purple-400' },
    { label: 'Tempo Médio', value: '1.2m', color: 'text-yellow-400' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Execução</h2>
          <p className="text-white/60">Monitoramento em tempo real das tarefas autônomas</p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systemStats.map((stat, index) => (
          <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Execution Tasks */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Tarefas em Execução</CardTitle>
          <CardDescription className="text-white/60">
            Status das operações autônomas em andamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {executionTasks.map((task) => (
            <div key={task.id} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <h4 className="font-medium text-white">{task.name}</h4>
                    <p className="text-sm text-white/60">{task.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </Badge>
                  <span className="text-xs text-white/60">{task.duration}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Progresso</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {task.status === 'running' && (
                  <Button variant="outline" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </Button>
                )}
                {task.status === 'pending' && (
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
                  </Button>
                )}
                {(task.status === 'error' || task.status === 'completed') && (
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Reiniciar
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Square className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Resources */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recursos do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>CPU</span>
                <span>65%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-400" style={{ width: '65%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>Memória</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-400" style={{ width: '78%' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>Rede</span>
                <span>42%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 rounded-full bg-purple-400" style={{ width: '42%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutionDashboard;

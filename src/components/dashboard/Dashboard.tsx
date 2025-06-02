
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageSquare, 
  FileText, 
  Search,
  Zap,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Stats de exemplo (em produção viriam de uma API)
  const stats = {
    totalConversations: 24,
    totalMemories: 156,
    totalDocuments: 89,
    weeklyGrowth: 12.5
  };

  const recentActivity = [
    { id: 1, type: 'chat', title: 'Nova conversa sobre React', time: '2 min atrás', status: 'success' },
    { id: 2, type: 'memory', title: 'Memória "Padrões de Design" atualizada', time: '15 min atrás', status: 'info' },
    { id: 3, type: 'document', title: 'Documento "API Guidelines" processado', time: '1h atrás', status: 'success' },
    { id: 4, type: 'search', title: 'Busca por "authentication patterns"', time: '2h atrás', status: 'info' }
  ];

  const quickActions = [
    {
      id: 'new-chat',
      title: 'Nova Conversa',
      description: 'Iniciar chat com IA',
      icon: MessageSquare,
      action: () => navigate('/?section=chat'),
      color: 'bg-blue-500'
    },
    {
      id: 'upload-doc',
      title: 'Adicionar Documento',
      description: 'Upload de arquivo',
      icon: FileText,
      action: () => navigate('/?section=documents'),
      color: 'bg-green-500'
    },
    {
      id: 'search',
      title: 'Busca Semântica',
      description: 'Pesquisar conhecimento',
      icon: Search,
      action: () => navigate('/?section=search'),
      color: 'bg-purple-500'
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajustar preferências',
      icon: Settings,
      action: () => navigate('/settings'),
      color: 'bg-gray-500'
    }
  ];

  const handleQuickAction = async (actionId: string, actionFn: () => void) => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Ação executada",
        description: `Executando ação: ${actionId}`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      actionFn();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível executar a ação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInsights = () => {
    toast({
      title: "Insights em desenvolvimento",
      description: "Esta funcionalidade será implementada em breve",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare;
      case 'memory': return Brain;
      case 'document': return FileText;
      case 'search': return Search;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto dashboard-scroll-container premium-scrollbar p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visão geral das suas atividades e estatísticas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memórias</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMemories}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Crescimento</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">+{stats.weeklyGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform"
                    onClick={() => handleQuickAction(action.id, action.action)}
                    disabled={isLoading}
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance do Sistema</CardTitle>
              <CardDescription>Estado atual dos componentes principais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">IA Response Time</span>
                  <span className="text-gray-900 dark:text-white">850ms</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Memory Utilization</span>
                  <span className="text-gray-900 dark:text-white">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Document Processing</span>
                  <span className="text-gray-900 dark:text-white">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Icon className={`h-5 w-5 ${getStatusColor(activity.status)}`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.time}</p>
                      </div>
                      <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                        {activity.status === 'success' ? 'Concluído' : 'Info'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Insights Inteligentes
              </CardTitle>
              <CardDescription>
                Análises e sugestões baseadas no seu uso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Insights em Desenvolvimento
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Estamos preparando insights personalizados baseados no seu padrão de uso
                </p>
                <Button onClick={handleViewInsights} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Progresso
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

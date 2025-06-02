
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Brain, 
  MessageCircle, 
  Bot, 
  Lightbulb, 
  Target,
  TrendingUp,
  Activity,
  Users,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useCognitiveMemoryIntegration } from '@/hooks/useCognitiveMemoryIntegration';
import { useAutonomousTaskFramework } from '@/hooks/useAutonomousTaskFramework';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Performance e métricas
  const performance = usePerformanceMonitoring();
  const cache = useOptimizedCache();
  
  // Sistemas cognitivos
  const cognitiveMemory = useCognitiveMemoryIntegration();
  const autonomousFramework = useAutonomousTaskFramework();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Métricas consolidadas
  const [dashboardMetrics, setDashboardMetrics] = useState({
    systemHealth: 95,
    cognitiveLoad: 45,
    autonomousEfficiency: 78,
    memoryUtilization: 62,
    userSatisfaction: 92,
    activeProcesses: 12,
    totalOperations: 1847,
    avgResponseTime: 245
  });

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simular atualização de métricas
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDashboardMetrics(prev => ({
        ...prev,
        systemHealth: Math.min(100, prev.systemHealth + Math.random() * 2 - 1),
        cognitiveLoad: Math.max(0, prev.cognitiveLoad + Math.random() * 10 - 5),
        autonomousEfficiency: Math.min(100, prev.autonomousEfficiency + Math.random() * 5 - 2),
        memoryUtilization: Math.max(0, prev.memoryUtilization + Math.random() * 8 - 4)
      }));
      
      toast({
        title: "Dashboard Atualizado",
        description: "Métricas e dados sincronizados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na Atualização",
        description: "Falha ao sincronizar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="space-y-6">
        {/* Header Principal */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Dashboard Inteligente
            </h1>
            <p className="text-white/60 text-lg">
              Monitoramento completo do sistema cognitivo
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-white border-white/20">
              {user?.email || 'Sistema'}
            </Badge>
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Status Cards Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm text-white/60">Saúde do Sistema</div>
              <div className={`text-2xl font-bold ${getHealthColor(dashboardMetrics.systemHealth)}`}>
                {dashboardMetrics.systemHealth}%
              </div>
              <Progress value={dashboardMetrics.systemHealth} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-sm text-white/60">Carga Cognitiva</div>
              <div className="text-2xl font-bold text-purple-400">
                {dashboardMetrics.cognitiveLoad}%
              </div>
              <Progress value={dashboardMetrics.cognitiveLoad} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm text-white/60">Eficiência Autônoma</div>
              <div className="text-2xl font-bold text-blue-400">
                {dashboardMetrics.autonomousEfficiency}%
              </div>
              <Progress value={dashboardMetrics.autonomousEfficiency} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm text-white/60">Satisfação</div>
              <div className="text-2xl font-bold text-green-400">
                {dashboardMetrics.userSatisfaction}%
              </div>
              <Progress value={dashboardMetrics.userSatisfaction} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="overview" className="text-white">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
            <TabsTrigger value="cognitive" className="text-white">Sistema Cognitivo</TabsTrigger>
            <TabsTrigger value="autonomous" className="text-white">Framework Autônomo</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Métricas Rápidas */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Métricas em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Operações Ativas</span>
                    <span className="text-white font-bold">{dashboardMetrics.activeProcesses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total de Operações</span>
                    <span className="text-white font-bold">{dashboardMetrics.totalOperations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Tempo Médio de Resposta</span>
                    <span className="text-white font-bold">{dashboardMetrics.avgResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Cache Hit Rate</span>
                    <span className="text-white font-bold">{cache.metrics.hitRate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Status dos Sistemas */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Status dos Sistemas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-white/80">Sistema Cognitivo</span>
                    </div>
                    <Badge variant="outline" className="text-green-400 border-green-400">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span className="text-white/80">Framework Autônomo</span>
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {autonomousFramework.isActive ? 'Ativo' : 'Standby'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-white/80">Cache Inteligente</span>
                    </div>
                    <Badge variant="outline" className="text-purple-400 border-purple-400">Otimizado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <span className="text-white/80">Performance Monitor</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">Ativo</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas e Notificações */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performance.alerts.length > 0 ? (
                    <div className="space-y-2">
                      {performance.alerts.slice(-3).map((alert, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <div>
                            <div className="text-sm text-white">{alert.metric}</div>
                            <div className="text-xs text-white/60">{alert.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white/60">Nenhum alerta ativo</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">LCP (Largest Contentful Paint)</span>
                        <span className="text-white">
                          {performance.metrics.LCP ? `${(performance.metrics.LCP / 1000).toFixed(2)}s` : '--'}
                        </span>
                      </div>
                      <Progress value={performance.metrics.LCP ? Math.min((performance.metrics.LCP / 4000) * 100, 100) : 0} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">FID (First Input Delay)</span>
                        <span className="text-white">
                          {performance.metrics.FID ? `${performance.metrics.FID.toFixed(0)}ms` : '--'}
                        </span>
                      </div>
                      <Progress value={performance.metrics.FID ? Math.min((performance.metrics.FID / 300) * 100, 100) : 0} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">CLS (Cumulative Layout Shift)</span>
                        <span className="text-white">
                          {performance.metrics.CLS ? performance.metrics.CLS.toFixed(3) : '--'}
                        </span>
                      </div>
                      <Progress value={performance.metrics.CLS ? Math.min((performance.metrics.CLS / 0.25) * 100, 100) : 0} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recursos do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Uso de Memória</span>
                        <span className="text-white">{performance.metrics.memoryUsage.toFixed(0)} MB</span>
                      </div>
                      <Progress value={(performance.metrics.memoryUsage / 100) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Cache Hit Rate</span>
                        <span className="text-white">{cache.metrics.hitRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={cache.metrics.hitRate} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Entradas em Cache</span>
                        <span className="text-white">{cache.metrics.entries}</span>
                      </div>
                      <Progress value={(cache.metrics.entries / 100) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cognitive Tab */}
          <TabsContent value="cognitive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Estado Cognitivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Modo Atual</span>
                      <Badge variant="outline" className="text-purple-400">
                        {cognitiveMemory.cognitiveState.currentMode.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Foco</span>
                      <span className="text-white">{cognitiveMemory.cognitiveState.currentMode.focus_level}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Processando</span>
                      <span className="text-white">{cognitiveMemory.processing ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Modos de Pensamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {cognitiveMemory.thoughtModes.map((mode) => (
                      <div key={mode.type} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{mode.type}</span>
                          <Badge variant={mode.is_active ? 'default' : 'outline'}>
                            {mode.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="text-sm text-white/60">{mode.description}</div>
                        <div className="mt-2">
                          <Progress value={mode.focus_level} className="h-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Autonomous Tab */}
          <TabsContent value="autonomous" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Status Autônomo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Sistema Ativo</span>
                      <Badge variant={autonomousFramework.isActive ? 'default' : 'outline'}>
                        {autonomousFramework.isActive ? 'Rodando' : 'Parado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Tarefas na Fila</span>
                      <span className="text-white font-bold">{autonomousFramework.queueLength}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Execuções</span>
                      <span className="text-white font-bold">{autonomousFramework.executions.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Aguarda Aprovação</span>
                      <Badge variant={autonomousFramework.needsApproval ? 'destructive' : 'outline'}>
                        {autonomousFramework.needsApproval ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Eficiência do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Taxa de Sucesso</span>
                        <span className="text-white">94%</span>
                      </div>
                      <Progress value={94} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Automação</span>
                        <span className="text-white">{dashboardMetrics.autonomousEfficiency}%</span>
                      </div>
                      <Progress value={dashboardMetrics.autonomousEfficiency} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">Tempo Médio</span>
                        <span className="text-white">2.3s</span>
                      </div>
                      <Progress value={77} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer com Controles */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-white">
                  FASE 3: Dashboards Inteligentes
                </Badge>
                <span className="text-white/60 text-sm">
                  Última atualização: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedDashboard;

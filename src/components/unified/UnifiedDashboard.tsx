import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Activity, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Database,
  Cpu,
  Network,
  Target,
  BarChart3
} from 'lucide-react';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useIntelligentMetrics } from '@/hooks/useIntelligentMetrics';
import { useCortexThinking } from '@/hooks/useCortexThinking';

interface ThoughtMode {
  id: string;
  name: string;
  active: boolean;
  focusLevel: number;
  description: string;
}

const UnifiedDashboard = () => {
  const cache = useOptimizedCache();
  const metrics = useIntelligentMetrics();
  const cortex = useCortexThinking();

  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 1,
    systemLoad: 0.65,
    responseTime: 245,
    cacheHitRate: 0.892,
    memoryUsage: 78.5,
    networkLatency: 12
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        systemLoad: Math.max(0.1, Math.min(1.0, prev.systemLoad + (Math.random() - 0.5) * 0.1)),
        responseTime: Math.max(100, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
        cacheHitRate: Math.max(0.7, Math.min(1.0, prev.cacheHitRate + (Math.random() - 0.5) * 0.05)),
        memoryUsage: Math.max(50, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(5, Math.min(50, prev.networkLatency + (Math.random() - 0.5) * 5))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Mock data para modos de pensamento
  const thoughtModes: ThoughtMode[] = [
    {
      id: 'analytical',
      name: 'Modo Analítico',
      active: true,
      focusLevel: 0.85,
      description: 'Processamento lógico e estruturado'
    },
    {
      id: 'creative',
      name: 'Modo Criativo',
      active: false,
      focusLevel: 0.65,
      description: 'Geração de ideias e soluções inovadoras'
    },
    {
      id: 'intuitive',
      name: 'Modo Intuitivo',
      active: true,
      focusLevel: 0.75,
      description: 'Reconhecimento de padrões e insights'
    }
  ];

  const getStatusColor = (value: number, threshold: number = 0.8) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'bg-green-500';
    if (value >= threshold * 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Central de Comando Unificada</h1>
              <p className="text-white/60">Dashboard integrado do sistema AlexIA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm">Sistema Online</span>
          </div>
        </div>

        {/* Métricas em Tempo Real */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-sm text-white/60">Usuários Ativos</div>
              <div className="text-2xl font-bold text-blue-400">{realTimeData.activeUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Cpu className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-sm text-white/60">Carga do Sistema</div>
              <div className={`text-2xl font-bold ${getStatusColor(1 - realTimeData.systemLoad)}`}>
                {(realTimeData.systemLoad * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-sm text-white/60">Tempo Resposta</div>
              <div className={`text-2xl font-bold ${getStatusColor(1 - (realTimeData.responseTime / 500))}`}>
                {realTimeData.responseTime.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-sm text-white/60">Cache Hit Rate</div>
              <div className="text-2xl font-bold text-purple-400">
                {(realTimeData.cacheHitRate * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-sm text-white/60">Uso Memória</div>
              <div className={`text-2xl font-bold ${getStatusColor(1 - (realTimeData.memoryUsage / 100))}`}>
                {realTimeData.memoryUsage.toFixed(0)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-sm text-white/60">Latência Rede</div>
              <div className={`text-2xl font-bold ${getStatusColor(1 - (realTimeData.networkLatency / 50))}`}>
                {realTimeData.networkLatency.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="cognitive">Sistema Cognitivo</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="cache">Cache & Memória</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status do Sistema */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">CPU</span>
                        <span className="text-white">{(realTimeData.systemLoad * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={realTimeData.systemLoad * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Memória</span>
                        <span className="text-white">{realTimeData.memoryUsage.toFixed(0)}%</span>
                      </div>
                      <Progress value={realTimeData.memoryUsage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Cache</span>
                        <span className="text-white">{(realTimeData.cacheHitRate * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={realTimeData.cacheHitRate * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="text-sm text-white/80">Sistema inicializado com sucesso</div>
                      <div className="text-xs text-white/60 ml-auto">agora</div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="text-sm text-white/80">Cache otimizado automaticamente</div>
                      <div className="text-xs text-white/60 ml-auto">2min</div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="text-sm text-white/80">Novos padrões detectados</div>
                      <div className="text-xs text-white/60 ml-auto">5min</div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="text-sm text-white/80">Métricas atualizadas</div>
                      <div className="text-xs text-white/60 ml-auto">8min</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cognitive" className="space-y-6">
            {/* Sistema Cognitivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Modos de Pensamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {thoughtModes.map((mode) => (
                      <div key={mode.id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${mode.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                            <span className="text-white font-medium">{mode.name}</span>
                          </div>
                          <Badge variant={mode.active ? 'default' : 'secondary'}>
                            {mode.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm mb-3">{mode.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-white/80 text-sm">Foco:</span>
                          <Progress value={mode.focusLevel * 100} className="h-2 flex-1" />
                          <span className="text-white text-sm">{(mode.focusLevel * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Estado Cognitivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-400 mb-2">87%</div>
                      <div className="text-white/80">Capacidade Cognitiva</div>
                      <Progress value={87} className="mt-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">142</div>
                        <div className="text-white/60 text-sm">Conexões Ativas</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">23</div>
                        <div className="text-white/60 text-sm">Padrões Ativos</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cache" className="space-y-6">
            {/* Cache e Memória */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Estatísticas de Cache
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Taxa de Acerto</span>
                      <span className="text-white font-semibold">
                        {(cache.stats.hitRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total de Entradas</span>
                      <span className="text-white font-semibold">
                        {cache.stats.entryCount}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Tamanho Total</span>
                      <span className="text-white font-semibold">
                        {(cache.stats.totalSize / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Uso de Memória</span>
                      <span className="text-white font-semibold">
                        {cache.stats.memoryUsage.toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Métricas Inteligentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Score de Performance</span>
                      <span className="text-white font-semibold">
                        {(metrics.performanceScore * 100).toFixed(0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Padrões Detectados</span>
                      <span className="text-white font-semibold">
                        {metrics.patternCount}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Anomalias</span>
                      <span className="text-white font-semibold">
                        {metrics.anomalyCount}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Eficiência</span>
                      <span className="text-white font-semibold">
                        {(metrics.efficiency * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Insights e Recomendações */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Insights do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 font-medium">Performance</span>
                    </div>
                    <p className="text-white/80 text-sm">
                      O sistema está operando 15% acima da média histórica. 
                      Cache otimizado automaticamente resultou em melhoria de 23% na latência.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">Otimização</span>
                    </div>
                    <p className="text-white/80 text-sm">
                      Detectados novos padrões de uso que podem ser utilizados para 
                      pré-carregamento inteligente de dados.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-purple-400 font-medium">Aprendizado</span>
                    </div>
                    <p className="text-white/80 text-sm">
                      Sistema cognitivo adaptou-se às preferências do usuário, 
                      melhorando precisão de predições em 18%.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedDashboard;

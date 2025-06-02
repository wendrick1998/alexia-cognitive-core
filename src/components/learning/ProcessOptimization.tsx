
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  TrendingUp, 
  Zap, 
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { useAutonomousLearning } from '@/hooks/useAutonomousLearning';

interface ProcessMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  trend: 'up' | 'down' | 'stable';
  improvementSuggestion: string;
  category: 'efficiency' | 'quality' | 'collaboration' | 'learning';
}

interface OptimizationRecommendation {
  id: string;
  processName: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  description: string;
  expectedImprovement: number;
  implementationSteps: string[];
}

const ProcessOptimization = () => {
  const {
    patterns,
    preferences,
    behaviorData,
    learningStats,
    optimizeMetaParameters
  } = useAutonomousLearning();

  const [metrics, setMetrics] = useState<ProcessMetric[]>([
    {
      id: '1',
      name: 'Eficiência de Tarefas',
      currentValue: 78,
      targetValue: 85,
      trend: 'up',
      improvementSuggestion: 'Automatizar tarefas repetitivas',
      category: 'efficiency'
    },
    {
      id: '2',
      name: 'Qualidade de Output',
      currentValue: 92,
      targetValue: 95,
      trend: 'stable',
      improvementSuggestion: 'Implementar peer review sistemático',
      category: 'quality'
    },
    {
      id: '3',
      name: 'Colaboração em Equipe',
      currentValue: 85,
      targetValue: 90,
      trend: 'up',
      improvementSuggestion: 'Melhorar ferramentas de comunicação',
      category: 'collaboration'
    },
    {
      id: '4',
      name: 'Velocidade de Aprendizado',
      currentValue: 73,
      targetValue: 80,
      trend: 'down',
      improvementSuggestion: 'Curriculum learning adaptativo',
      category: 'learning'
    }
  ]);

  const [optimizations, setOptimizations] = useState<OptimizationRecommendation[]>([
    {
      id: '1',
      processName: 'Revisão de Código',
      impact: 'high',
      effort: 'medium',
      description: 'Implementar sistema automatizado de revisão prévia com IA',
      expectedImprovement: 25,
      implementationSteps: [
        'Configurar regras de análise estática',
        'Treinar modelo para padrões específicos',
        'Integrar com workflow existente',
        'Monitorar e ajustar parâmetros'
      ]
    },
    {
      id: '2',
      processName: 'Gestão de Conhecimento',
      impact: 'high',
      effort: 'low',
      description: 'Otimizar captura e compartilhamento de insights',
      expectedImprovement: 30,
      implementationSteps: [
        'Automatizar documentação de decisões',
        'Criar sistema de tags inteligentes',
        'Implementar busca semântica',
        'Estabelecer rotinas de consolidação'
      ]
    },
    {
      id: '3',
      processName: 'Priorização de Tarefas',
      impact: 'medium',
      effort: 'low',
      description: 'Algoritmo adaptativo baseado em contexto e histórico',
      expectedImprovement: 20,
      implementationSteps: [
        'Analisar padrões de conclusão',
        'Implementar scoring dinâmico',
        'Integrar feedback de resultados',
        'Refinamento contínuo'
      ]
    }
  ]);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        currentValue: Math.min(100, metric.currentValue + (Math.random() - 0.5) * 2)
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getMetricTrendIcon = (trend: ProcessMetric['trend']) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: OptimizationRecommendation['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getEffortColor = (effort: OptimizationRecommendation['effort']) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const handleImplementOptimization = (optimizationId: string) => {
    console.log(`🚀 Implementing optimization: ${optimizationId}`);
    setOptimizations(prev => prev.filter(opt => opt.id !== optimizationId));
    
    // Simulate metric improvement
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      currentValue: Math.min(100, metric.currentValue + Math.random() * 10),
      trend: 'up' as const
    })));
  };

  const getCategoryIcon = (category: ProcessMetric['category']) => {
    switch (category) {
      case 'efficiency': return <Zap className="w-4 h-4" />;
      case 'quality': return <Target className="w-4 h-4" />;
      case 'collaboration': return <Activity className="w-4 h-4" />;
      case 'learning': return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600" />
            Otimização de Processos
          </h1>
          <p className="text-gray-600 mt-1">Sistema automático de melhoria contínua baseado em dados</p>
        </div>
        
        <Button onClick={optimizeMetaParameters} className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Otimizar Agora
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getCategoryIcon(metric.category)}
                {metric.name}
              </CardTitle>
              {getMetricTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.currentValue.toFixed(1)}%</div>
              <div className="flex justify-between items-center mt-2">
                <Progress value={(metric.currentValue / metric.targetValue) * 100} className="flex-1 mr-2" />
                <span className="text-sm text-gray-500">{metric.targetValue}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metric.improvementSuggestion}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="optimizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recomendações de Otimização
              </CardTitle>
              <CardDescription>
                Melhorias automáticas baseadas em análise de padrões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((optimization) => (
                  <Card key={optimization.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{optimization.processName}</h4>
                          <p className="text-gray-600 text-sm mt-1">{optimization.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge className={getImpactColor(optimization.impact)}>
                            {optimization.impact} impact
                          </Badge>
                          <Badge className={getEffortColor(optimization.effort)}>
                            {optimization.effort} effort
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Melhoria esperada:</span> +{optimization.expectedImprovement}%
                        </div>
                        <Progress value={optimization.expectedImprovement} className="w-24 h-2" />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Passos de implementação:</p>
                        <ol className="text-sm space-y-1">
                          {optimization.implementationSteps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleImplementOptimization(optimization.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Implementar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Clock className="w-4 h-4 mr-1" />
                          Agendar
                        </Button>
                        <Button size="sm" variant="ghost">
                          Simular Impacto
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Padrões de Comportamento</CardTitle>
                <CardDescription>Análise temporal dos seus hábitos de trabalho</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <div className="font-medium mb-2">Padrões mais frequentes:</div>
                    {patterns.slice(0, 3).map((pattern, index) => (
                      <div key={pattern.id} className="flex justify-between items-center py-1">
                        <span>{pattern.pattern.join(' → ')}</span>
                        <Badge variant="outline">{pattern.frequency}x</Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium mb-2">Horários mais produtivos:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Manhã (9h-12h)</span>
                        <Progress value={85} className="w-16 h-2" />
                      </div>
                      <div className="flex justify-between">
                        <span>Tarde (14h-17h)</span>
                        <Progress value={70} className="w-16 h-2" />
                      </div>
                      <div className="flex justify-between">
                        <span>Noite (19h-22h)</span>
                        <Progress value={45} className="w-16 h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferências Aprendidas</CardTitle>
                <CardDescription>Adaptações automáticas do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {preferences.slice(0, 5).map((pref) => (
                    <div key={pref.feature} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{pref.feature}</div>
                        <div className="text-xs text-gray-500">
                          Confiança: {Math.round(pref.confidence * 100)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={((pref.preference + 1) / 2) * 100} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm text-gray-600">
                          {pref.preference > 0 ? '👍' : '👎'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automações Ativas
              </CardTitle>
              <CardDescription>
                Processos automatizados para melhoria contínua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Otimização de Parâmetros</h4>
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Ajuste automático de hiperparâmetros de aprendizado
                      </p>
                      <div className="text-xs text-gray-500">
                        Última execução: agora mesmo
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Detecção de Anomalias</h4>
                        <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Monitoramento contínuo de padrões atípicos
                      </p>
                      <div className="text-xs text-gray-500">
                        Última execução: 2 min atrás
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Mineração de Padrões</h4>
                        <Badge className="bg-purple-100 text-purple-800">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Descoberta automática de sequências comportamentais
                      </p>
                      <div className="text-xs text-gray-500">
                        Última execução: 5 min atrás
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Consolidação de Memória</h4>
                        <Badge className="bg-orange-100 text-orange-800">Agendado</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Transferência periódica para memória de longo prazo
                      </p>
                      <div className="text-xs text-gray-500">
                        Próxima execução: em 25 min
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessOptimization;

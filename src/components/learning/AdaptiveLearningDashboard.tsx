
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Settings,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useContinuousLearning } from '@/hooks/useContinuousLearning';
import { useToast } from '@/hooks/use-toast';

const AdaptiveLearningDashboard = () => {
  const { toast } = useToast();
  const {
    metrics,
    adaptiveConfig,
    learningEvents,
    recommendations,
    isOptimizing,
    recordLearningEvent,
    performAdaptiveOptimization,
    applyRecommendation,
    predictUserAction,
    processFeedback,
    learningStats
  } = useContinuousLearning();

  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [predictionContext, setPredictionContext] = useState('');

  const handleApplyRecommendation = async (recommendationId: string) => {
    try {
      await applyRecommendation(recommendationId);
      toast({
        title: "Otimização Aplicada",
        description: "A recomendação foi aplicada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao aplicar otimização",
        variant: "destructive",
      });
    }
  };

  const handlePredictAction = () => {
    const prediction = predictUserAction({ context: predictionContext });
    toast({
      title: "Predição de Ação",
      description: `Ação prevista: ${prediction.predictedAction} (${(prediction.confidence * 100).toFixed(0)}% confiança)`,
    });
  };

  const handleFeedback = (action: string, feedback: 'positive' | 'negative' | 'neutral') => {
    processFeedback(action, feedback, { source: 'dashboard' });
    toast({
      title: "Feedback Registrado",
      description: `Feedback ${feedback} para ${action} foi processado`,
    });
  };

  // Auto-refresh metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // Metrics are updated automatically by the hook
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Aprendizado Contínuo</h2>
            <p className="text-white/60">Sistema adaptativo de otimização inteligente</p>
          </div>
        </div>
        
        <Button 
          onClick={performAdaptiveOptimization}
          disabled={isOptimizing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isOptimizing ? (
            <>
              <Settings className="w-4 h-4 mr-2 animate-spin" />
              Otimizando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Otimizar Sistema
            </>
          )}
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-sm text-white/60">Adaptação</div>
            <div className="text-xl font-bold text-green-400">{(metrics.adaptationSpeed * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-sm text-white/60">Precisão</div>
            <div className="text-xl font-bold text-blue-400">{(metrics.predictionAccuracy * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-sm text-white/60">Padrões</div>
            <div className="text-xl font-bold text-yellow-400">{(metrics.patternRecognition * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-sm text-white/60">Satisfação</div>
            <div className="text-xl font-bold text-purple-400">{(metrics.userSatisfaction * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-sm text-white/60">Eficiência</div>
            <div className="text-xl font-bold text-orange-400">{(metrics.systemEfficiency * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Brain className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-sm text-white/60">Progresso</div>
            <div className="text-xl font-bold text-pink-400">{(metrics.learningProgress * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5">
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="prediction">Predição</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Otimizações Recomendadas
              </CardTitle>
              <CardDescription className="text-white/60">
                Sugestões baseadas em análise adaptativa do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <p>Sistema otimizado! Nenhuma recomendação pendente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {rec.type}
                          </Badge>
                          <Badge variant={rec.complexity === 'high' ? 'destructive' : rec.complexity === 'medium' ? 'default' : 'secondary'}>
                            {rec.complexity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Clock className="w-4 h-4" />
                          {rec.estimatedTime}min
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                      <p className="text-sm text-white/70 mb-3">{rec.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-white/60">Impacto: </span>
                            <span className="text-green-400">{(rec.expectedImpact * 100).toFixed(0)}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-white/60">Prioridade: </span>
                            <span className="text-yellow-400">{rec.priority}/10</span>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleApplyRecommendation(rec.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Aplicar
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Eventos de Aprendizado
              </CardTitle>
              <CardDescription className="text-white/60">
                Histórico de eventos e adaptações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {learningEvents.slice(0, 20).map((event) => (
                  <div key={event.id} className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs text-white/60">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">
                        Impacto: {(event.impact * 100).toFixed(0)}%
                      </span>
                      <span className="text-sm text-white/60">
                        Confiança: {(event.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5" />
                Predição de Comportamento
              </CardTitle>
              <CardDescription className="text-white/60">
                Teste o sistema de predição de ações do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Contexto para Predição
                </label>
                <input
                  type="text"
                  value={predictionContext}
                  onChange={(e) => setPredictionContext(e.target.value)}
                  placeholder="Digite um contexto para predição..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
                />
              </div>
              
              <Button onClick={handlePredictAction} className="w-full">
                Executar Predição
              </Button>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFeedback('chat', 'positive')}
                  className="text-green-400 border-green-400"
                >
                  ✓ Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFeedback('search', 'positive')}
                  className="text-blue-400 border-blue-400"
                >
                  ✓ Busca
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFeedback('upload', 'negative')}
                  className="text-red-400 border-red-400"
                >
                  ✗ Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração Adaptativa
              </CardTitle>
              <CardDescription className="text-white/60">
                Parâmetros do sistema de aprendizado contínuo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Taxa de Aprendizado
                  </label>
                  <div className="p-3 bg-white/10 rounded border border-white/20 text-white">
                    {adaptiveConfig.learningRate.toFixed(3)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Limite de Adaptação
                  </label>
                  <div className="p-3 bg-white/10 rounded border border-white/20 text-white">
                    {adaptiveConfig.adaptationThreshold.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Peso do Feedback
                  </label>
                  <div className="p-3 bg-white/10 rounded border border-white/20 text-white">
                    {adaptiveConfig.feedbackWeight.toFixed(2)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Limite de Performance
                  </label>
                  <div className="p-3 bg-white/10 rounded border border-white/20 text-white">
                    {adaptiveConfig.performanceThreshold.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="font-medium text-white mb-2">Estatísticas de Aprendizado</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Total de Eventos: </span>
                    <span className="text-white">{learningStats.totalEvents}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Impacto Recente: </span>
                    <span className="text-white">{(learningStats.recentImpact * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-white/60">Taxa de Adaptação: </span>
                    <span className="text-white">{learningStats.adaptationRate.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Otimizações Pendentes: </span>
                    <span className="text-white">{learningStats.optimizationsPending}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdaptiveLearningDashboard;

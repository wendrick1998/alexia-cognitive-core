
import { Brain, Activity, Zap, Cpu, TrendingUp, Database } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const CortexDashboard = () => {
  const cognitiveMetrics = [
    { label: 'Processamento Neural', value: 87, color: 'bg-blue-500', icon: Brain },
    { label: 'Capacidade de Memória', value: 73, color: 'bg-green-500', icon: Database },
    { label: 'Velocidade de Inferência', value: 92, color: 'bg-purple-500', icon: Zap },
    { label: 'Eficiência Energética', value: 68, color: 'bg-orange-500', icon: Cpu }
  ];

  const recentInsights = [
    { type: 'Padrão', description: 'Identificado aumento de 23% na eficiência de respostas', timestamp: '2 min atrás' },
    { type: 'Anomalia', description: 'Latência elevada detectada no módulo de linguagem', timestamp: '5 min atrás' },
    { type: 'Otimização', description: 'Cache de memória reorganizado automaticamente', timestamp: '8 min atrás' },
    { type: 'Aprendizado', description: 'Novos padrões incorporados do feedback do usuário', timestamp: '12 min atrás' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-3">
          <BackButton to="/" />
          <Breadcrumbs 
            items={[
              { label: 'Cortex Dashboard', current: true }
            ]}
            className="mt-2"
          />
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500" />
            Cortex Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor em tempo real do sistema cognitivo e insights de IA
          </p>
        </div>

        {/* Status Geral */}
        <Card className="dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Activity className="w-5 h-5" />
              Status do Sistema Cognitivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cognitiveMetrics.map((metric) => (
                <div key={metric.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <metric.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {metric.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {metric.value}%
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="dark:bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Consultas/min</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  +12% hoje
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Tempo Resposta</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">234ms</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  Excelente
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Acurácia</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">96.8%</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                  Optimal
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Recentes */}
        <Card className="dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Insights Recentes</CardTitle>
            <CardDescription>
              Descobertas e otimizações automáticas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    insight.type === 'Padrão' ? 'bg-blue-500' :
                    insight.type === 'Anomalia' ? 'bg-red-500' :
                    insight.type === 'Otimização' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {insight.type}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {insight.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CortexDashboard;

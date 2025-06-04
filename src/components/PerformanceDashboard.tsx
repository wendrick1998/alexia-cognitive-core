
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Cpu, Database, Globe, Zap, TrendingUp } from 'lucide-react';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';

const PerformanceDashboard = () => {
  const { metrics, getHealthScore, getSystemStatus } = useSystemMonitor();
  
  const healthScore = getHealthScore();
  const systemStatus = getSystemStatus();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500" />
          Dashboard de Performance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitoramento em tempo real do sistema Alex IA
        </p>
      </div>

      {/* Health Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Score de Saúde do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-green-600">
              {healthScore}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${
                    healthScore >= 80 ? 'bg-green-500' :
                    healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Status: {systemStatus === 'healthy' ? 'Saudável' :
                        systemStatus === 'warning' ? 'Atenção' : 'Crítico'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
            <CardDescription>Largest Contentful Paint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.LCP ? `${(metrics.LCP / 1000).toFixed(2)}s` : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Meta: &lt; 2.5s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">FID</CardTitle>
            <CardDescription>First Input Delay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.FID ? `${metrics.FID.toFixed(0)}ms` : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Meta: &lt; 100ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">CLS</CardTitle>
            <CardDescription>Cumulative Layout Shift</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.CLS ? metrics.CLS.toFixed(3) : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Meta: &lt; 0.1
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Recursos do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Uso de Memória</span>
                <span className="text-sm font-medium">
                  {metrics.memoryUsage.toFixed(1)} MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (metrics.memoryUsage / 100) * 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">JS Heap Size</span>
                <span className="text-sm font-medium">
                  {metrics.jsHeapSize.toFixed(1)} MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (metrics.jsHeapSize / 100) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Performance de Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Tempo de Resposta API</span>
              <span className="text-sm font-medium">
                {metrics.apiResponseTime.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm">Taxa de Cache Hit</span>
              <span className="text-sm font-medium">
                {(metrics.cacheHitRate * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm">Taxa de Erro</span>
              <span className="text-sm font-medium">
                {(metrics.errorRate).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Dicas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">✓ Funcionando Bem</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Service Worker ativo</li>
                <li>• Cache funcionando</li>
                <li>• PWA instalável</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">💡 Otimizações</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Lazy loading ativo</li>
                <li>• Compressão de assets</li>
                <li>• Code splitting implementado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;

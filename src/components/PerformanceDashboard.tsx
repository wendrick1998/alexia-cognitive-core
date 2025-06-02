
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { 
  Zap, 
  Activity, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Download,
  X 
} from 'lucide-react';

const PerformanceDashboard: React.FC = () => {
  const { 
    metrics, 
    alerts, 
    getPerformanceScore,
    updateMetric,
    trackAPICall
  } = usePerformanceMonitoring();

  const performanceScore = getPerformanceScore();

  const exportAnalytics = () => {
    const data = {
      metrics,
      alerts,
      score: performanceScore,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAlerts = () => {
    // Clear alerts functionality would be implemented in the hook
    console.log('Clearing alerts...');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}
              </div>
              <Badge variant={getScoreBadge(performanceScore)} className="mt-2">
                {performanceScore >= 90 ? 'Excelente' : 
                 performanceScore >= 70 ? 'Bom' : 'Precisa Melhorar'}
              </Badge>
            </div>
            <div className="flex-1 mx-8">
              <Progress value={performanceScore} className="h-3" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-2 bg-slate-50 rounded">
              <div className="font-semibold text-slate-600">Satisfação</div>
              <div className="text-lg font-bold text-blue-600">
                {metrics.userSatisfaction}%
              </div>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded">
              <div className="font-semibold text-slate-600">Taxa de Erro</div>
              <div className="text-lg font-bold text-red-600">
                {metrics.errorRate.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded">
              <div className="font-semibold text-slate-600">Cache Hit</div>
              <div className="text-lg font-bold text-green-600">
                {metrics.cacheHitRate.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded">
              <div className="font-semibold text-slate-600">Memória</div>
              <div className="text-lg font-bold text-purple-600">
                {metrics.memoryUsage.toFixed(0)} MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LCP */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics.LCP ? `${(metrics.LCP / 1000).toFixed(2)}s` : '--'}
              </div>
              <div className="text-sm font-medium text-slate-600 mb-2">
                Largest Contentful Paint
              </div>
              <Progress 
                value={metrics.LCP ? Math.min((metrics.LCP / 4000) * 100, 100) : 0} 
                className="h-2"
              />
              <div className="text-xs text-slate-500 mt-1">
                Target: &lt; 2.5s
              </div>
            </div>

            {/* FID */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics.FID ? `${metrics.FID.toFixed(0)}ms` : '--'}
              </div>
              <div className="text-sm font-medium text-slate-600 mb-2">
                First Input Delay
              </div>
              <Progress 
                value={metrics.FID ? Math.min((metrics.FID / 300) * 100, 100) : 0} 
                className="h-2"
              />
              <div className="text-xs text-slate-500 mt-1">
                Target: &lt; 100ms
              </div>
            </div>

            {/* CLS */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {metrics.CLS ? metrics.CLS.toFixed(3) : '--'}
              </div>
              <div className="text-sm font-medium text-slate-600 mb-2">
                Cumulative Layout Shift
              </div>
              <Progress 
                value={metrics.CLS ? Math.min((metrics.CLS / 0.25) * 100, 100) : 0} 
                className="h-2"
              />
              <div className="text-xs text-slate-500 mt-1">
                Target: &lt; 0.1
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Response Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">First Contentful Paint</span>
              <span className="font-semibold">
                {metrics.FCP ? `${(metrics.FCP / 1000).toFixed(2)}s` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Time to First Byte</span>
              <span className="font-semibold">
                {metrics.TTFB ? `${metrics.TTFB.toFixed(0)}ms` : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">API Response Time</span>
              <span className="font-semibold">
                {metrics.apiResponseTime.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Render Time</span>
              <span className="font-semibold">
                {metrics.renderTime.toFixed(0)}ms
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Memory Usage</span>
                <span className="font-semibold">{metrics.memoryUsage.toFixed(0)} MB</span>
              </div>
              <Progress value={(metrics.memoryUsage / 100) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">JS Heap Size</span>
                <span className="font-semibold">{metrics.jsHeapSize.toFixed(0)} MB</span>
              </div>
              <Progress value={(metrics.jsHeapSize / 50) * 100} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-slate-500 text-center">
                Otimização contínua ativa 🔄
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Performance Alerts
              </CardTitle>
              <Button 
                onClick={clearAlerts}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(-5).map((alert, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'critical' 
                      ? 'bg-red-50 border-red-200 text-red-800' 
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">
                      {alert.metric.toUpperCase()}: {alert.value.toFixed(2)}
                    </div>
                    <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.type}
                    </Badge>
                  </div>
                  <div className="text-xs mt-1 opacity-80">
                    {alert.message}
                  </div>
                  <div className="text-xs mt-1 opacity-60">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Analytics & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={exportAnalytics} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              <Users className="w-4 h-4 mr-2" />
              Relatório Semanal
            </Button>
          </div>
          <div className="mt-4 text-xs text-slate-500 text-center">
            Dados coletados respeitando privacidade LGPD
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;

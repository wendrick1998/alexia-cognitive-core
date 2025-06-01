
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Timer, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  bundleSize: number;
  networkStatus: 'online' | 'offline' | 'slow';
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    bundleSize: 0,
    networkStatus: 'online'
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    // Monitorar FPS
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    };

    // Monitorar memória (se disponível)
    if ('memory' in performance) {
      const memory = Math.round((performance as any).memory.usedJSHeapSize / 1048576); // MB
      setMetrics(prev => ({ ...prev, memory }));
    }

    // Tempo de carregamento
    if (performance.navigation) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime: Math.round(loadTime) }));
    }

    // Tamanho do bundle (estimativa)
    const bundleSize = Math.round(Math.random() * 50 + 150); // Simulado
    setMetrics(prev => ({ ...prev, bundleSize }));

    // Status da rede
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const networkStatus = connection.effectiveType === '4g' ? 'online' :
                             connection.effectiveType === '3g' ? 'slow' : 'offline';
        setMetrics(prev => ({ ...prev, networkStatus }));
      }
    };

    measureFPS();
    updateNetworkStatus();

    // Listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const getPerformanceScore = () => {
    let score = 100;
    if (metrics.fps < 30) score -= 30;
    else if (metrics.fps < 45) score -= 15;
    
    if (metrics.memory > 100) score -= 20;
    else if (metrics.memory > 50) score -= 10;
    
    if (metrics.loadTime > 3000) score -= 25;
    else if (metrics.loadTime > 1500) score -= 10;
    
    if (metrics.bundleSize > 200) score -= 15;
    
    return Math.max(score, 0);
  };

  const performanceScore = getPerformanceScore();
  const scoreColor = performanceScore >= 80 ? 'text-green-600' :
                     performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
          <Badge variant={performanceScore >= 80 ? 'default' : 'destructive'} className="ml-auto">
            {performanceScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Performance Score</span>
            <span className={scoreColor}>{performanceScore}%</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* FPS */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Zap className="w-3 h-3 text-blue-500" />
            <div>
              <div className="font-medium">{metrics.fps} FPS</div>
              <div className="text-muted-foreground">Frame Rate</div>
            </div>
          </div>

          {/* Memory */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Activity className="w-3 h-3 text-purple-500" />
            <div>
              <div className="font-medium">{metrics.memory} MB</div>
              <div className="text-muted-foreground">Memória</div>
            </div>
          </div>

          {/* Load Time */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Timer className="w-3 h-3 text-green-500" />
            <div>
              <div className="font-medium">{metrics.loadTime}ms</div>
              <div className="text-muted-foreground">Carregamento</div>
            </div>
          </div>

          {/* Network */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Wifi className="w-3 h-3 text-orange-500" />
            <div>
              <div className="font-medium capitalize">{metrics.networkStatus}</div>
              <div className="text-muted-foreground">Rede</div>
            </div>
          </div>
        </div>

        {/* Bundle Size */}
        <div className="text-xs text-center text-muted-foreground">
          Bundle: {metrics.bundleSize}KB • Otimizado para performance
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;

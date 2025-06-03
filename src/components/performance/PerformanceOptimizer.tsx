
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Cpu, 
  Zap, 
  Settings, 
  Gauge, 
  Battery, 
  Wifi,
  HardDrive,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptimizedAnimation } from '@/hooks/useOptimizedAnimation';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  frameRate: number;
  batteryLevel: number;
  connectionType: string;
}

interface OptimizationSettings {
  reducedMotion: boolean;
  lowPowerMode: boolean;
  imageCompression: boolean;
  prefetching: boolean;
  backgroundSync: boolean;
  advancedCaching: boolean;
}

export const PerformanceOptimizer: React.FC = () => {
  const { config, shouldAnimate, getAnimationDuration } = useOptimizedAnimation();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    networkLatency: 120,
    frameRate: 60,
    batteryLevel: 85,
    connectionType: '4g'
  });

  const [settings, setSettings] = useState<OptimizationSettings>({
    reducedMotion: config.reducedMotion,
    lowPowerMode: false,
    imageCompression: true,
    prefetching: true,
    backgroundSync: true,
    advancedCaching: true
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState(78);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        networkLatency: Math.max(50, Math.min(300, prev.networkLatency + (Math.random() - 0.5) * 20)),
        frameRate: shouldAnimate ? 60 : 30
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [shouldAnimate]);

  useEffect(() => {
    // Calculate optimization score based on settings and metrics
    const settingsScore = Object.values(settings).filter(Boolean).length * 10;
    const performanceScore = 100 - (
      (metrics.cpuUsage * 0.3) + 
      (metrics.memoryUsage * 0.3) + 
      (metrics.networkLatency / 300 * 40)
    );
    
    setOptimizationScore(Math.round((settingsScore + performanceScore) / 2));
  }, [settings, metrics]);

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Apply optimizations
    setMetrics(prev => ({
      ...prev,
      cpuUsage: Math.max(prev.cpuUsage * 0.8, 20),
      memoryUsage: Math.max(prev.memoryUsage * 0.85, 30),
      networkLatency: Math.max(prev.networkLatency * 0.9, 50)
    }));
    
    setIsOptimizing(false);
    console.log('⚡ Performance optimization completed');
  };

  const updateSetting = (key: keyof OptimizationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMetricStatus = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return { color: 'text-green-500', status: 'Ótimo' };
    if (value <= thresholds[1]) return { color: 'text-yellow-500', status: 'Bom' };
    return { color: 'text-red-500', status: 'Alto' };
  };

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: getAnimationDuration(0.3) }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Gauge className="h-5 w-5" />
              Score de Performance
            </CardTitle>
            <CardDescription>
              Avaliação geral do sistema Alex iA
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="relative">
              <motion.div
                className={`text-4xl font-bold ${getScoreColor(optimizationScore)}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {optimizationScore}
              </motion.div>
              <div className="text-sm text-muted-foreground">/ 100</div>
            </div>
            
            <Progress 
              value={optimizationScore} 
              className="h-3"
            />
            
            <Button 
              onClick={runOptimization}
              disabled={isOptimizing}
              className="w-full"
            >
              {isOptimizing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Otimizar Sistema
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real-time Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: getAnimationDuration(0.3), delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CPU Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">CPU</span>
                </div>
                <Badge variant="outline" className={getMetricStatus(metrics.cpuUsage, [50, 70]).color}>
                  {metrics.cpuUsage.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Memória</span>
                </div>
                <Badge variant="outline" className={getMetricStatus(metrics.memoryUsage, [60, 80]).color}>
                  {metrics.memoryUsage.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>

            {/* Network Latency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Latência</span>
                </div>
                <Badge variant="outline" className={getMetricStatus(metrics.networkLatency, [100, 200]).color}>
                  {metrics.networkLatency.toFixed(0)}ms
                </Badge>
              </div>
              <Progress value={(metrics.networkLatency / 300) * 100} className="h-2" />
            </div>

            {/* Battery Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Bateria</span>
                </div>
                <Badge variant="outline" className={getMetricStatus(100 - metrics.batteryLevel, [20, 50]).color}>
                  {metrics.batteryLevel}%
                </Badge>
              </div>
              <Progress value={metrics.batteryLevel} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Optimization Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: getAnimationDuration(0.3), delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Otimização
            </CardTitle>
            <CardDescription>
              Ajuste as configurações para melhor performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">
                    {key === 'reducedMotion' && 'Movimento Reduzido'}
                    {key === 'lowPowerMode' && 'Modo Economia'}
                    {key === 'imageCompression' && 'Compressão de Imagens'}
                    {key === 'prefetching' && 'Pré-carregamento'}
                    {key === 'backgroundSync' && 'Sincronização em Background'}
                    {key === 'advancedCaching' && 'Cache Avançado'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {key === 'reducedMotion' && 'Reduz animações para melhor performance'}
                    {key === 'lowPowerMode' && 'Reduz uso de bateria e CPU'}
                    {key === 'imageCompression' && 'Comprime imagens automaticamente'}
                    {key === 'prefetching' && 'Carrega recursos antecipadamente'}
                    {key === 'backgroundSync' && 'Sincroniza dados em segundo plano'}
                    {key === 'advancedCaching' && 'Usa cache semântico inteligente'}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => updateSetting(key as keyof OptimizationSettings, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PerformanceOptimizer;

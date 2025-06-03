
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Zap, HardDrive, TrendingUp, TrendingDown } from 'lucide-react';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { motion } from 'framer-motion';

interface CacheMonitorProps {
  className?: string;
}

export const CacheMonitor: React.FC<CacheMonitorProps> = ({ className }) => {
  const { stats, getStats, clear } = useOptimizedCache();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate refresh delay
    getStats();
    setIsRefreshing(false);
  };

  const clearCache = () => {
    clear();
    console.log('🧹 Cache cleared manually');
  };

  const getHitRateColor = (rate: number) => {
    if (rate >= 0.8) return 'text-green-500';
    if (rate >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryPressure = (usage: number) => {
    if (usage < 30) return { level: 'Low', color: 'text-green-500', icon: TrendingUp };
    if (usage < 70) return { level: 'Medium', color: 'text-yellow-500', icon: TrendingUp };
    return { level: 'High', color: 'text-red-500', icon: TrendingDown };
  };

  const memoryPressure = getMemoryPressure(stats.memoryUsage);
  const MemoryIcon = memoryPressure.icon;

  return (
    <div className={className}>
      <Card className="border-gray-200/50 dark:border-gray-700/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-medium">Cache Performance</CardTitle>
            <CardDescription>
              Sistema de cache otimizado em tempo real
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
            >
              <Database className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Hit Rate */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Taxa de Acerto</span>
              </div>
              <Badge variant="outline" className={getHitRateColor(stats.hitRate)}>
                {(stats.hitRate * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress value={stats.hitRate * 100} className="h-2" />
          </motion.div>

          {/* Memory Usage */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Uso de Memória</span>
              </div>
              <div className="flex items-center gap-2">
                <MemoryIcon className={`h-4 w-4 ${memoryPressure.color}`} />
                <Badge variant="outline" className={memoryPressure.color}>
                  {stats.memoryUsage.toFixed(1)} MB
                </Badge>
              </div>
            </div>
            <Progress value={(stats.memoryUsage / 50) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Pressão de memória: {memoryPressure.level}
            </p>
          </motion.div>

          {/* Cache Entries */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Entradas no Cache</span>
              </div>
              <Badge variant="outline">
                {stats.entryCount.toLocaleString()}
              </Badge>
            </div>
            <Progress value={(stats.entryCount / 1000) * 100} className="h-2" />
          </motion.div>

          {/* Compression Ratio */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Taxa de Compressão</span>
              </div>
              <Badge variant="outline">
                {(stats.compressionRatio * 100).toFixed(1)}%
              </Badge>
            </div>
            <Progress value={stats.compressionRatio * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(stats.entryCount * stats.compressionRatio)} entradas comprimidas
            </p>
          </motion.div>

          {/* Performance Summary */}
          <motion.div 
            className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tamanho Total:</span>
                <p className="font-medium">{(stats.totalSize / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <span className="text-muted-foreground">Eficiência:</span>
                <p className={`font-medium ${getHitRateColor(stats.hitRate)}`}>
                  {stats.hitRate >= 0.8 ? 'Excelente' : 
                   stats.hitRate >= 0.6 ? 'Boa' : 'Baixa'}
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheMonitor;

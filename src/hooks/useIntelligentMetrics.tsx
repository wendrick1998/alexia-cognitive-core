
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useCognitiveMemoryIntegration } from '@/hooks/useCognitiveMemoryIntegration';

export interface IntelligentMetrics {
  systemHealth: number;
  cognitiveLoad: number;
  autonomousEfficiency: number;
  memoryUtilization: number;
  userSatisfaction: number;
  predictedTrends: {
    performance: 'up' | 'down' | 'stable';
    usage: 'up' | 'down' | 'stable';
    satisfaction: 'up' | 'down' | 'stable';
  };
  recommendations: Array<{
    type: 'performance' | 'cognitive' | 'autonomous' | 'cache';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action?: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

export function useIntelligentMetrics() {
  const { user } = useAuth();
  const performance = usePerformanceMonitoring();
  const cache = useOptimizedCache();
  const cognitive = useCognitiveMemoryIntegration();

  const [metrics, setMetrics] = useState<IntelligentMetrics>({
    systemHealth: 95,
    cognitiveLoad: 45,
    autonomousEfficiency: 78,
    memoryUtilization: 62,
    userSatisfaction: 92,
    predictedTrends: {
      performance: 'stable',
      usage: 'up',
      satisfaction: 'up'
    },
    recommendations: [],
    alerts: []
  });

  const [isCollecting, setIsCollecting] = useState(false);

  // Calcular métricas inteligentes
  const calculateIntelligentMetrics = useCallback(async () => {
    if (!user) return;

    setIsCollecting(true);

    try {
      // Calcular saúde do sistema baseada em performance
      const performanceScore = performance.getPerformanceScore();
      const cacheHitRate = cache.metrics.hitRate;
      const systemHealth = Math.round((performanceScore + cacheHitRate) / 2);

      // Calcular carga cognitiva baseada no processamento ativo
      const cognitiveLoad = cognitive.processing ? 75 : 35;

      // Calcular eficiência autônoma (simulado por enquanto)
      const autonomousEfficiency = Math.round(85 + Math.random() * 10);

      // Calcular utilização de memória
      const memoryUtilization = Math.round((cache.metrics.memoryUsage / 1024) * 100);

      // Gerar recomendações inteligentes
      const recommendations = generateRecommendations({
        performanceScore,
        cacheHitRate,
        memoryUsage: cache.metrics.memoryUsage,
        cognitiveProcessing: cognitive.processing
      });

      // Gerar alertas baseados nas métricas
      const alerts = generateAlerts({
        systemHealth,
        memoryUtilization,
        performanceScore
      });

      setMetrics(prev => ({
        ...prev,
        systemHealth,
        cognitiveLoad,
        autonomousEfficiency,
        memoryUtilization,
        recommendations,
        alerts: [...prev.alerts.filter(a => !a.resolved), ...alerts]
      }));

    } catch (error) {
      console.error('❌ Erro ao calcular métricas inteligentes:', error);
    } finally {
      setIsCollecting(false);
    }
  }, [user, performance, cache, cognitive]);

  // Gerar recomendações baseadas nas métricas
  const generateRecommendations = (data: {
    performanceScore: number;
    cacheHitRate: number;
    memoryUsage: number;
    cognitiveProcessing: boolean;
  }) => {
    const recommendations = [];

    if (data.performanceScore < 70) {
      recommendations.push({
        type: 'performance' as const,
        priority: 'high' as const,
        title: 'Performance Baixa Detectada',
        description: 'O sistema está apresentando lentidão. Considere otimizar consultas e reduzir carga.',
        action: 'optimize_queries'
      });
    }

    if (data.cacheHitRate < 60) {
      recommendations.push({
        type: 'cache' as const,
        priority: 'medium' as const,
        title: 'Taxa de Cache Baixa',
        description: 'Aumente o tempo de vida do cache ou otimize as chaves de cache.',
        action: 'optimize_cache'
      });
    }

    if (data.memoryUsage > 500) {
      recommendations.push({
        type: 'performance' as const,
        priority: 'medium' as const,
        title: 'Alto Uso de Memória',
        description: 'Considere limpar o cache ou reduzir o tamanho dos dados em memória.',
        action: 'cleanup_memory'
      });
    }

    if (data.cognitiveProcessing) {
      recommendations.push({
        type: 'cognitive' as const,
        priority: 'low' as const,
        title: 'Sistema Cognitivo Ativo',
        description: 'O sistema está processando intensivamente. Monitor para evitar sobrecarga.',
        action: 'monitor_cognitive'
      });
    }

    return recommendations;
  };

  // Gerar alertas baseados nas métricas
  const generateAlerts = (data: {
    systemHealth: number;
    memoryUtilization: number;
    performanceScore: number;
  }) => {
    const alerts = [];

    if (data.systemHealth < 80) {
      alerts.push({
        id: `health-${Date.now()}`,
        type: 'warning' as const,
        title: 'Saúde do Sistema Baixa',
        message: `Saúde do sistema em ${data.systemHealth}%. Monitoramento necessário.`,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (data.memoryUtilization > 80) {
      alerts.push({
        id: `memory-${Date.now()}`,
        type: 'error' as const,
        title: 'Alto Uso de Memória',
        message: `Utilização de memória em ${data.memoryUtilization}%. Ação imediata necessária.`,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (data.performanceScore > 90) {
      alerts.push({
        id: `perf-${Date.now()}`,
        type: 'info' as const,
        title: 'Performance Excelente',
        message: `Sistema operando em performance ótima (${data.performanceScore}%).`,
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  };

  // Resolver alerta
  const resolveAlert = useCallback((alertId: string) => {
    setMetrics(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    }));
  }, []);

  // Aplicar recomendação
  const applyRecommendation = useCallback(async (action: string) => {
    console.log(`🔧 Aplicando recomendação: ${action}`);
    
    switch (action) {
      case 'optimize_cache':
        cache.cleanup();
        break;
      case 'cleanup_memory':
        cache.clear();
        break;
      default:
        console.log(`Ação não implementada: ${action}`);
    }
    
    // Recalcular métricas após aplicar recomendação
    setTimeout(calculateIntelligentMetrics, 1000);
  }, [cache, calculateIntelligentMetrics]);

  // Atualizar métricas periodicamente
  useEffect(() => {
    if (!user) return;

    // Cálculo inicial
    calculateIntelligentMetrics();

    // Atualizar a cada 30 segundos
    const interval = setInterval(calculateIntelligentMetrics, 30000);

    return () => clearInterval(interval);
  }, [user, calculateIntelligentMetrics]);

  return {
    metrics,
    isCollecting,
    calculateIntelligentMetrics,
    resolveAlert,
    applyRecommendation,
    
    // Métricas específicas para facilitar o acesso
    systemHealth: metrics.systemHealth,
    cognitiveLoad: metrics.cognitiveLoad,
    autonomousEfficiency: metrics.autonomousEfficiency,
    memoryUtilization: metrics.memoryUtilization,
    userSatisfaction: metrics.userSatisfaction,
    
    // Dados analíticos
    recommendations: metrics.recommendations,
    activeAlerts: metrics.alerts.filter(a => !a.resolved),
    trends: metrics.predictedTrends
  };
}

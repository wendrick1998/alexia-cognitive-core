
/**
 * @description Hook para monitoramento de performance de bundle
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import { useState, useEffect, useCallback } from 'react';

interface BundleMetrics {
  chunkCount: number;
  totalSize: number;
  loadTime: number;
  cacheHitRate: number;
  criticalResourcesLoaded: boolean;
}

interface PerformanceEntry {
  name: string;
  size: number;
  loadTime: number;
  cached: boolean;
}

export function useBundlePerformance() {
  const [metrics, setMetrics] = useState<BundleMetrics>({
    chunkCount: 0,
    totalSize: 0,
    loadTime: 0,
    cacheHitRate: 0,
    criticalResourcesLoaded: false
  });

  const [resourceEntries, setResourceEntries] = useState<PerformanceEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analisar performance de recursos carregados
  const analyzeResources = useCallback(() => {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const entries: PerformanceEntry[] = [];
      
      let totalSize = 0;
      let cachedCount = 0;
      let chunkCount = 0;
      
      resources.forEach(resource => {
        // Focar em JS chunks e CSS
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          const size = resource.transferSize || 0;
          const loadTime = resource.responseEnd - resource.startTime;
          const cached = resource.transferSize === 0 && resource.decodedBodySize > 0;
          
          entries.push({
            name: resource.name.split('/').pop() || 'unknown',
            size,
            loadTime,
            cached
          });
          
          totalSize += size;
          if (cached) cachedCount++;
          if (resource.name.includes('.js')) chunkCount++;
        }
      });

      const cacheHitRate = entries.length > 0 ? (cachedCount / entries.length) * 100 : 0;
      const avgLoadTime = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.loadTime, 0) / entries.length 
        : 0;

      // Verificar se recursos críticos foram carregados
      const criticalResources = ['react-vendor', 'ui-vendor', 'main'];
      const criticalResourcesLoaded = criticalResources.every(critical =>
        entries.some(entry => entry.name.includes(critical))
      );

      setMetrics({
        chunkCount,
        totalSize: Math.round(totalSize / 1024), // KB
        loadTime: Math.round(avgLoadTime),
        cacheHitRate: Math.round(cacheHitRate),
        criticalResourcesLoaded
      });

      setResourceEntries(entries);
    } catch (error) {
      console.error('Erro ao analisar performance de bundle:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Obter métricas detalhadas de Core Web Vitals
  const getCoreWebVitals = useCallback(() => {
    if (typeof performance === 'undefined') {
      return null;
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;

    return {
      // Largest Contentful Paint
      lcp: navigation.loadEventEnd - navigation.fetchStart,
      // First Input Delay (aproximado)
      fid: navigation.domInteractive - navigation.domLoading,
      // Cumulative Layout Shift (necessita Observer)
      cls: 0, // Seria calculado com PerformanceObserver
      // First Contentful Paint
      fcp: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      // Time to Interactive
      tti: navigation.domInteractive - navigation.fetchStart
    };
  }, []);

  // Verificar se bundle está otimizado
  const getBundleHealth = useCallback(() => {
    const { totalSize, loadTime, chunkCount, cacheHitRate } = metrics;
    
    let score = 100;
    const issues: string[] = [];

    // Verificar tamanho total (ideal < 500KB)
    if (totalSize > 500) {
      score -= 20;
      issues.push(`Bundle muito grande: ${totalSize}KB (ideal < 500KB)`);
    }

    // Verificar tempo de carregamento (ideal < 3s)
    if (loadTime > 3000) {
      score -= 20;
      issues.push(`Carregamento lento: ${loadTime}ms (ideal < 3000ms)`);
    }

    // Verificar número de chunks (ideal < 10)
    if (chunkCount > 10) {
      score -= 15;
      issues.push(`Muitos chunks: ${chunkCount} (ideal < 10)`);
    }

    // Verificar cache hit rate (ideal > 70%)
    if (cacheHitRate < 70) {
      score -= 15;
      issues.push(`Cache hit rate baixo: ${cacheHitRate}% (ideal > 70%)`);
    }

    return {
      score: Math.max(0, score),
      issues,
      status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs-improvement'
    };
  }, [metrics]);

  // Analisar automaticamente quando componente monta
  useEffect(() => {
    // Aguardar um pouco para recursos carregarem
    const timer = setTimeout(analyzeResources, 2000);
    return () => clearTimeout(timer);
  }, [analyzeResources]);

  // Re-analisar a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(analyzeResources, 30000);
    return () => clearInterval(interval);
  }, [analyzeResources]);

  return {
    metrics,
    resourceEntries,
    isAnalyzing,
    analyzeResources,
    getCoreWebVitals,
    getBundleHealth
  };
}

export default useBundlePerformance;

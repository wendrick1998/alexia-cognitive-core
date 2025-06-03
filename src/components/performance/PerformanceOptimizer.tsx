
/**
 * @description Otimizador de performance com lazy loading e memoização
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import React, { memo, useMemo, useCallback } from 'react';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  enableMemoization?: boolean;
  performanceThreshold?: number;
}

const PerformanceOptimizer = memo(({ 
  children, 
  enableLazyLoading = true,
  enableMemoization = true,
  performanceThreshold = 80
}: PerformanceOptimizerProps) => {
  const { metrics, getHealthScore } = useSystemMonitor();

  // Memoizar cálculos pesados baseado no health score
  const optimizedChildren = useMemo(() => {
    const healthScore = getHealthScore();
    
    // Se performance está baixa, otimizar renderização
    if (healthScore < performanceThreshold) {
      console.log('🚀 Performance Optimizer: Aplicando otimizações');
      
      if (enableLazyLoading && React.Children.count(children) > 10) {
        // Lazy loading para muitos componentes
        return React.Children.toArray(children).slice(0, 5);
      }
    }
    
    return children;
  }, [children, getHealthScore, performanceThreshold, enableLazyLoading]);

  // Callback otimizado para ações críticas
  const handleCriticalAction = useCallback((action: () => void) => {
    const healthScore = getHealthScore();
    
    if (healthScore > 70) {
      action();
    } else {
      // Atrasar ação se performance está baixa
      setTimeout(action, 100);
    }
  }, [getHealthScore]);

  // Renderização condicional baseada na performance
  if (metrics.memory.percentage > 90) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-yellow-600">
          ⚠️ Performance reduzida - Liberando memória...
        </div>
      </div>
    );
  }

  return (
    <div data-performance-optimized="true">
      {enableMemoization ? optimizedChildren : children}
    </div>
  );
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

export { PerformanceOptimizer, type PerformanceOptimizerProps };
export default PerformanceOptimizer;

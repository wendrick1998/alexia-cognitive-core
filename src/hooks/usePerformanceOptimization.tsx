
/**
 * @description Hook para otimizações de performance
 * @created_by Performance Optimization Sprint
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { semanticCache } from '@/services/SemanticCache';

interface PerformanceConfig {
  enableSemanticCache: boolean;
  enableImageOptimization: boolean;
  enableComponentLazyLoading: boolean;
  cacheThreshold: number;
}

interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  totalQueries: number;
  cacheHitRate: number;
}

export function usePerformanceOptimization(config: Partial<PerformanceConfig> = {}) {
  const defaultConfig: PerformanceConfig = {
    enableSemanticCache: true,
    enableImageOptimization: true,
    enableComponentLazyLoading: true,
    cacheThreshold: 0.85,
  };

  const finalConfig = { ...defaultConfig, ...config };
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    totalQueries: 0,
    cacheHitRate: 0
  });

  const performanceRef = useRef<{
    cacheHits: number;
    cacheMisses: number;
    avgResponseTime: number;
  }>({
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
  });

  // Medir performance de componentes
  const measureComponentRender = useCallback((componentName: string) => {
    if (typeof performance !== 'undefined') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        console.log(`🚀 Component ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
        
        if (renderTime > 100) {
          console.warn(`⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
        }
      };
    }
    
    return () => {};
  }, []);

  // Otimizar consulta com cache semântico
  const optimizedLLMQuery = useCallback(async (
    question: string,
    taskType: string,
    modelName: string,
    provider: string,
    userId: string
  ) => {
    if (!finalConfig.enableSemanticCache) {
      return null;
    }

    try {
      const startTime = performance.now();
      
      const embedding = await semanticCache.generateEmbedding(question);
      const cachedResponse = await semanticCache.findSimilar(
        question,
        taskType,
        embedding
      );

      const endTime = performance.now();
      
      if (cachedResponse) {
        performanceRef.current.cacheHits++;
        console.log(`💾 Cache hit! Resposta recuperada em ${(endTime - startTime).toFixed(2)}ms`);
        return cachedResponse;
      } else {
        performanceRef.current.cacheMisses++;
        console.log(`🔍 Cache miss. Consulta nova necessária.`);
        return null;
      }
    } catch (error) {
      console.error('Erro na otimização de consulta:', error);
      return null;
    }
  }, [finalConfig.enableSemanticCache]);

  // Armazenar resposta no cache
  const cacheResponse = useCallback(async (
    question: string,
    answer: string,
    taskType: string,
    modelName: string,
    provider: string,
    tokensUsed: number,
    userId: string,
    metadata: Record<string, any> = {}
  ) => {
    if (!finalConfig.enableSemanticCache) {
      return false;
    }

    try {
      const embedding = await semanticCache.generateEmbedding(question);
      
      return await semanticCache.store(
        question,
        answer,
        embedding,
        taskType,
        modelName,
        provider,
        tokensUsed,
        userId,
        metadata
      );
    } catch (error) {
      console.error('Erro ao armazenar no cache:', error);
      return false;
    }
  }, [finalConfig.enableSemanticCache]);

  // Obter estatísticas de performance
  const getPerformanceStats = useCallback(() => {
    const totalQueries = performanceRef.current.cacheHits + performanceRef.current.cacheMisses;
    const cacheHitRate = totalQueries > 0 ? (performanceRef.current.cacheHits / totalQueries) * 100 : 0;

    const newMetrics = {
      cacheHits: performanceRef.current.cacheHits,
      cacheMisses: performanceRef.current.cacheMisses,
      cacheHitRate: Math.round(cacheHitRate),
      totalQueries,
      avgResponseTime: performanceRef.current.avgResponseTime,
    };

    setMetrics(newMetrics);
    return newMetrics;
  }, []);

  // Limpeza periódica do cache
  useEffect(() => {
    if (!finalConfig.enableSemanticCache) return;

    const cleanupInterval = setInterval(async () => {
      try {
        const removedEntries = await semanticCache.cleanupOldEntries();
        if (removedEntries > 0) {
          console.log(`🧹 Cache cleanup: ${removedEntries} entradas antigas removidas`);
        }
      } catch (error) {
        console.error('Erro na limpeza do cache:', error);
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, [finalConfig.enableSemanticCache]);

  // Atualizar métricas periodicamente
  useEffect(() => {
    const interval = setInterval(getPerformanceStats, 5000);
    return () => clearInterval(interval);
  }, [getPerformanceStats]);

  return {
    measureComponentRender,
    optimizedLLMQuery,
    cacheResponse,
    getPerformanceStats,
    config: finalConfig,
    metrics,
  };
}


import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { llmLogger, LLMMetrics } from '@/services/LLMLogger';

export interface FallbackMetrics {
  totalFallbacks: number;
  fallbacksByReason: Record<string, number>;
  fallbacksByModel: Record<string, number>;
  avgResponseTimeWithFallback: number;
  avgResponseTimeWithoutFallback: number;
}

export interface CostMetrics {
  totalCost: number;
  costByPeriod: Record<string, number>;
  costByModel: Record<string, number>;
  costByTask: Record<string, number>;
}

export function useLLMMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<LLMMetrics[]>([]);
  const [fallbackMetrics, setFallbackMetrics] = useState<FallbackMetrics | null>(null);
  const [costMetrics, setCostMetrics] = useState<CostMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModelMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await llmLogger.getModelStats();
      // Transform data to metrics format
      const transformedMetrics: LLMMetrics[] = data.map(item => ({
        modelName: item.model_name,
        provider: item.provider,
        totalCalls: 1,
        successRate: item.status === 'success' ? 1 : 0,
        avgResponseTime: item.response_time,
        totalTokensUsed: item.total_tokens,
        totalCost: item.estimated_cost,
        fallbackRate: 0,
        cacheHitRate: 0
      }));
      
      setMetrics(transformedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar métricas');
      console.error('Error fetching model metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mockData: FallbackMetrics = {
        totalFallbacks: 0,
        fallbacksByReason: {},
        fallbacksByModel: {},
        avgResponseTimeWithFallback: 0,
        avgResponseTimeWithoutFallback: 0
      };
      
      setFallbackMetrics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar métricas de fallback');
      console.error('Error fetching fallback metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCostMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mockData: CostMetrics = {
        totalCost: 0,
        costByPeriod: {},
        costByModel: {},
        costByTask: {}
      };
      
      setCostMetrics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar métricas de custo');
      console.error('Error fetching cost metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllMetrics = async () => {
    await Promise.all([
      fetchModelMetrics(),
      fetchFallbackMetrics(),
      fetchCostMetrics()
    ]);
  };

  // Buscar métricas iniciais
  useEffect(() => {
    if (user) {
      refreshAllMetrics();
    }
  }, [user]);

  return {
    metrics,
    fallbackMetrics,
    costMetrics,
    loading,
    error,
    fetchModelMetrics,
    fetchFallbackMetrics,
    fetchCostMetrics,
    refreshAllMetrics,
    logger: llmLogger
  };
}

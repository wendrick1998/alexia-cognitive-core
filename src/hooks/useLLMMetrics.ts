
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LLMLogger, LLMMetrics } from '@/services/LLMLogger';

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

  const logger = new LLMLogger({
    userId: user?.id || 'anonymous'
  });

  const fetchModelMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await logger.getMetricsByModel();
      setMetrics(data);
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
      
      const data = await logger.getFallbackMetrics();
      setFallbackMetrics(data);
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
      
      const data = await logger.getCostMetrics();
      setCostMetrics(data);
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
    logger
  };
}

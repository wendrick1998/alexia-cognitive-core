
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LLMMetrics, llmLogger } from '@/services/LLMLogger';

interface FallbackMetrics {
  totalFallbacks: number;
  fallbacksByReason: Record<string, number>;
  fallbacksByModel: Record<string, number>;
  avgResponseTimeWithFallback: number;
  avgResponseTimeWithoutFallback: number;
}

interface CostMetrics {
  totalCost: number;
  costByPeriod: Record<string, number>;
  costByModel: Record<string, number>;
  costByTask: Record<string, number>;
}

export function useLLMMetrics() {
  const [metrics, setMetrics] = useState<LLMMetrics[]>([]);
  const [fallbackMetrics, setFallbackMetrics] = useState<FallbackMetrics | null>(null);
  const [costMetrics, setCostMetrics] = useState<CostMetrics | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['llm-metrics'],
    queryFn: async () => {
      return await llmLogger.getMetrics();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: fallbackData } = useQuery({
    queryKey: ['llm-fallback-metrics'],
    queryFn: async () => {
      return await llmLogger.getFallbackMetrics();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: costData } = useQuery({
    queryKey: ['llm-cost-metrics'],
    queryFn: async () => {
      return await llmLogger.getCostMetrics();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    if (data) {
      setMetrics(data);
    }
  }, [data]);

  useEffect(() => {
    if (fallbackData) {
      setFallbackMetrics(fallbackData);
    }
  }, [fallbackData]);

  useEffect(() => {
    if (costData) {
      setCostMetrics(costData);
    }
  }, [costData]);

  const refreshAllMetrics = async () => {
    await refetch();
  };

  const getActiveModels = () => {
    return metrics.filter(metric => metric.status === 'active');
  };

  const getAverageResponseTime = () => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, metric) => sum + metric.response_time, 0) / metrics.length;
  };

  const getTotalCalls = () => {
    return metrics.reduce((sum, metric) => sum + metric.total_calls, 0);
  };

  const getSuccessRate = () => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, metric) => sum + metric.success_rate, 0) / metrics.length;
  };

  const getTotalCost = () => {
    return metrics.reduce((sum, metric) => sum + metric.estimated_cost, 0);
  };

  return {
    metrics,
    fallbackMetrics,
    costMetrics,
    isLoading,
    loading: isLoading, // Alias for compatibility
    error,
    refetch,
    refreshAllMetrics,
    getActiveModels,
    getAverageResponseTime,
    getTotalCalls,
    getSuccessRate,
    getTotalCost,
  };
}

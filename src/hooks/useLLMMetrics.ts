
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LLMMetrics, llmLogger } from '@/services/LLMLogger';

export function useLLMMetrics() {
  const [metrics, setMetrics] = useState<LLMMetrics[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['llm-metrics'],
    queryFn: async () => {
      return await llmLogger.getMetrics();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (data) {
      setMetrics(data);
    }
  }, [data]);

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
    isLoading,
    error,
    refetch,
    getActiveModels,
    getAverageResponseTime,
    getTotalCalls,
    getSuccessRate,
    getTotalCost,
  };
}

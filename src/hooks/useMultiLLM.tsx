
/**
 * @file useMultiLLM.tsx
 * @description Hook para usar o sistema multi-LLM
 */

import { useState, useCallback } from 'react';
import { multiLLMRouter, LLMRequest, LLMResponse } from '@/services/MultiLLMRouter';
import { useToast } from '@/hooks/use-toast';

export function useMultiLLM() {
  const [processing, setProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<LLMResponse | null>(null);
  const [providerStats, setProviderStats] = useState(multiLLMRouter.getProviderStats());
  const { toast } = useToast();

  const processRequest = useCallback(async (request: LLMRequest): Promise<LLMResponse | null> => {
    if (processing) return null;

    try {
      setProcessing(true);
      const response = await multiLLMRouter.routeRequest(request);
      setLastResponse(response);
      setProviderStats(multiLLMRouter.getProviderStats());
      
      return response;
    } catch (error) {
      console.error('Multi-LLM processing error:', error);
      toast({
        title: "Erro no processamento",
        description: "Falha ao processar com todos os provedores disponíveis",
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  }, [processing, toast]);

  const updateProviderStatus = useCallback((providerId: string, isAvailable: boolean, responseTime?: number) => {
    multiLLMRouter.updateProviderStatus(providerId, isAvailable, responseTime);
    setProviderStats(multiLLMRouter.getProviderStats());
  }, []);

  return {
    processing,
    lastResponse,
    providerStats,
    processRequest,
    updateProviderStatus,
    router: multiLLMRouter
  };
}

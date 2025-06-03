
/**
 * @description Hook para usar o sistema multi-LLM com fallover automático
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import { useState, useCallback } from 'react';
import { multiLLMRouter, LLMRequest, LLMResponse, TaskType, Priority } from '@/services/MultiLLMRouter';
import { useToast } from '@/hooks/use-toast';

export function useMultiLLMRouter() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<LLMResponse | null>(null);
  const [providerStats, setProviderStats] = useState(multiLLMRouter.getProviderStats());
  const [healthStatus, setHealthStatus] = useState(multiLLMRouter.getHealthStatus());
  const { toast } = useToast();

  const processRequest = useCallback(async (
    prompt: string, 
    options: {
      taskType?: TaskType;
      priority?: Priority;
      maxTokens?: number;
      temperature?: number;
      userId?: string;
    } = {}
  ): Promise<LLMResponse | null> => {
    if (isProcessing) {
      toast({
        title: "Processamento em andamento",
        description: "Aguarde o processamento atual terminar",
        variant: "default",
      });
      return null;
    }

    const request: LLMRequest = {
      prompt,
      taskType: options.taskType || 'general',
      priority: options.priority || 'medium',
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      userId: options.userId
    };

    try {
      setIsProcessing(true);
      const response = await multiLLMRouter.routeRequest(request);
      setLastResponse(response);
      
      // Atualizar estatísticas
      setProviderStats(multiLLMRouter.getProviderStats());
      setHealthStatus(multiLLMRouter.getHealthStatus());
      
      if (response.fallbackUsed) {
        toast({
          title: "Fallback utilizado",
          description: `Resposta gerada via ${response.provider} (fallback)`,
          variant: "default",
        });
      }
      
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
      setIsProcessing(false);
    }
  }, [isProcessing, toast]);

  const processInQueue = useCallback(async (
    prompt: string,
    options: {
      taskType?: TaskType;
      priority?: Priority;
      maxTokens?: number;
      temperature?: number;
      userId?: string;
    } = {}
  ): Promise<LLMResponse | null> => {
    const request: LLMRequest = {
      prompt,
      taskType: options.taskType || 'general',
      priority: options.priority || 'medium',
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      userId: options.userId
    };

    try {
      const response = await multiLLMRouter.addToQueue(request);
      setLastResponse(response);
      setProviderStats(multiLLMRouter.getProviderStats());
      setHealthStatus(multiLLMRouter.getHealthStatus());
      
      return response;
    } catch (error) {
      console.error('Multi-LLM queue processing error:', error);
      toast({
        title: "Erro na fila de processamento",
        description: "Falha ao processar requisição na fila",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const updateProviderStatus = useCallback((providerId: string, isAvailable: boolean, responseTime?: number) => {
    multiLLMRouter.updateProviderStatus(providerId, isAvailable, responseTime);
    setProviderStats(multiLLMRouter.getProviderStats());
    setHealthStatus(multiLLMRouter.getHealthStatus());
  }, []);

  const refreshStats = useCallback(() => {
    setProviderStats(multiLLMRouter.getProviderStats());
    setHealthStatus(multiLLMRouter.getHealthStatus());
  }, []);

  return {
    isProcessing,
    lastResponse,
    providerStats,
    healthStatus,
    processRequest,
    processInQueue,
    updateProviderStatus,
    refreshStats,
    router: multiLLMRouter
  };
}

export default useMultiLLMRouter;

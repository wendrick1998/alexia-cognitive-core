
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMultiLLM } from '@/hooks/useMultiLLM';
import { useSecurity } from '@/hooks/useSecurity';
import { supabase } from '@/integrations/supabase/client';
import { llmLogger } from '@/services/LLMLogger';
import type { TaskType as LLMTaskType, Priority } from '@/services/MultiLLMRouter';

export interface ChatResponse {
  response: string;
  context_used: boolean;
  chunks_found: number;
  model?: string;
  metadata?: {
    fromCache?: boolean;
    usedFallback?: boolean;
    originalModel?: string;
    responseTime?: number;
    provider?: string;
    confidence?: number;
  };
}

export function useChatProcessor() {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { processRequest: processLLMRequest } = useMultiLLM();
  const { checkRateLimit, sanitizeInput } = useSecurity();

  const processMessage = async (
    userMessage: string,
    conversationId: string,
    projectId?: string
  ): Promise<ChatResponse | null> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para enviar mensagens",
        variant: "destructive",
      });
      return null;
    }

    // Verificar rate limiting
    if (!checkRateLimit(user.id)) {
      toast({
        title: "Limite de taxa excedido",
        description: "Aguarde um momento antes de enviar outra mensagem",
        variant: "destructive",
      });
      return null;
    }

    // Sanitizar entrada
    const sanitizedMessage = sanitizeInput(userMessage.trim());
    
    if (!sanitizedMessage) {
      toast({
        title: "Mensagem inválida",
        description: "A mensagem contém conteúdo potencialmente perigoso",
        variant: "destructive",
      });
      return null;
    }

    try {
      setProcessing(true);
      console.log(`Processing message with Multi-LLM: "${sanitizedMessage.substring(0, 100)}..."`);

      const startTime = new Date();

      // Determinar prioridade e tipo da tarefa
      const taskType = detectTaskType(sanitizedMessage);
      const priority = detectPriority(sanitizedMessage);

      // Processar com sistema multi-LLM
      const llmResponse = await processLLMRequest({
        prompt: sanitizedMessage,
        taskType,
        priority,
        maxTokens: 4000,
        temperature: 0.7
      });

      if (!llmResponse) {
        throw new Error('Falha no processamento multi-LLM');
      }

      const endTime = new Date();

      // Simular busca de contexto (integração com sistema existente)
      const { data: contextData } = await supabase.functions.invoke('search-context', {
        body: { 
          query: sanitizedMessage,
          user_id: user.id,
          conversation_id: conversationId
        }
      });

      const chatResponse: ChatResponse = {
        response: llmResponse.content,
        context_used: contextData?.context_used || false,
        chunks_found: contextData?.chunks_found || 0,
        model: llmResponse.model,
        metadata: {
          fromCache: false,
          usedFallback: llmResponse.confidence < 0.9,
          originalModel: llmResponse.model,
          responseTime: llmResponse.responseTime,
          provider: llmResponse.provider,
          confidence: llmResponse.confidence
        }
      };

      // Log da operação
      await llmLogger.logCall({
        modelName: llmResponse.model,
        provider: llmResponse.provider.toLowerCase(),
        taskType,
        question: sanitizedMessage,
        answer: llmResponse.content,
        startTime,
        endTime,
        tokensInput: Math.ceil(sanitizedMessage.length / 4),
        tokensOutput: llmResponse.tokensUsed,
        estimatedCost: llmResponse.cost,
        userId: user.id,
        sessionId: conversationId,
        status: 'success',
        usedFallback: llmResponse.confidence < 0.9,
        cacheHit: false
      });

      console.log('Message processed successfully with Multi-LLM:', {
        provider: llmResponse.provider,
        model: llmResponse.model,
        confidence: llmResponse.confidence,
        responseTime: llmResponse.responseTime
      });

      return chatResponse;
    } catch (error) {
      console.error('Error in processMessage:', error);

      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro inesperado ao processar a mensagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    processMessage
  };
}

function detectTaskType(message: string): LLMTaskType {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('código') || lowerMessage.includes('programar') || lowerMessage.includes('function') || lowerMessage.includes('debug')) {
    return 'coding';
  }
  
  if (lowerMessage.includes('analisar') || lowerMessage.includes('dados') || lowerMessage.includes('estatística') || lowerMessage.includes('relatório')) {
    return 'analysis';
  }
  
  if (lowerMessage.includes('criar') || lowerMessage.includes('escrever') || lowerMessage.includes('história') || lowerMessage.includes('criativo')) {
    return 'creative';
  }
  
  if (lowerMessage.includes('técnico') || lowerMessage.includes('arquitetura') || lowerMessage.includes('implementar') || lowerMessage.includes('sistema')) {
    return 'technical';
  }
  
  return 'general';
}

function detectPriority(message: string): Priority {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('urgente') || lowerMessage.includes('crítico') || lowerMessage.includes('emergência')) {
    return 'critical';
  }
  
  if (lowerMessage.includes('importante') || lowerMessage.includes('prioridade') || lowerMessage.includes('rápido')) {
    return 'high';
  }
  
  if (lowerMessage.includes('quando possível') || lowerMessage.includes('sem pressa')) {
    return 'low';
  }
  
  return 'medium';
}

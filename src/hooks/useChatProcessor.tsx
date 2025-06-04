
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { llmLogger } from '@/services/LLMLogger';

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

    try {
      setProcessing(true);
      console.log(`Processing message: "${userMessage.substring(0, 100)}..."`);

      const startTime = Date.now();

      // Simular processamento da mensagem
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const tokensUsed = Math.floor(userMessage.length / 4); // Estimativa simples

      // Simular resposta da IA
      const aiResponse = `Entendi sua mensagem: "${userMessage}". Esta é uma resposta simulada do sistema Alex IA.`;

      const chatResponse: ChatResponse = {
        response: aiResponse,
        context_used: Math.random() > 0.5,
        chunks_found: Math.floor(Math.random() * 5),
        model: 'gpt-4',
        metadata: {
          fromCache: false,
          usedFallback: false,
          originalModel: 'gpt-4',
          responseTime,
          provider: 'openai',
          confidence: 0.95
        }
      };

      // Log da operação
      await llmLogger.logCall('gpt-4', 'openai', tokensUsed, responseTime, true);

      console.log('Message processed successfully:', {
        provider: 'openai',
        model: 'gpt-4',
        responseTime
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

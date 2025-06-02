
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LLMLogger from '@/services/LLMLogger';

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
  };
}

export function useChatProcessor() {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Inicializar logger
  const logger = new LLMLogger({
    userId: user?.id || 'anonymous',
    enableRealTimeLogging: true
  });

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

    if (!userMessage.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Digite uma mensagem para enviar",
        variant: "destructive",
      });
      return null;
    }

    let callId: string | null = null;

    try {
      setProcessing(true);
      console.log(`Processing message: "${userMessage.substring(0, 100)}..."`);

      // Iniciar logging
      callId = await logger.logStart(
        'gpt-4o-mini', // modelo padrão
        'openai',
        'general', // tipo de tarefa padrão
        userMessage,
        Math.ceil(userMessage.length / 4), // estimativa de tokens de entrada
        { conversationId, projectId }
      );

      const startTime = Date.now();

      const { data, error } = await supabase.functions.invoke('process-chat-message', {
        body: { 
          user_message: userMessage.trim(),
          user_id: user.id,
          project_id: projectId,
          conversation_id: conversationId
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (error) {
        console.error('Error calling process-chat-message function:', error);
        
        // Log do erro
        if (callId) {
          await logger.logEnd(
            callId,
            0, // answer length
            0, // tokens output
            'error',
            {
              errorMessage: error.message,
              additionalMetadata: { error: error.toString() }
            }
          );
        }

        toast({
          title: "Erro no processamento",
          description: `Falha ao processar mensagem: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      const chatResponse = data as ChatResponse;
      
      // Log de sucesso
      if (callId) {
        await logger.logEnd(
          callId,
          chatResponse.response.length,
          Math.ceil(chatResponse.response.length / 4), // estimativa de tokens de saída
          'success',
          {
            usedFallback: chatResponse.metadata?.usedFallback || false,
            fallbackReason: chatResponse.metadata?.usedFallback ? 'primary_model_failed' : undefined,
            cacheHit: chatResponse.metadata?.fromCache || false,
            additionalMetadata: {
              contextUsed: chatResponse.context_used,
              chunksFound: chatResponse.chunks_found,
              model: chatResponse.model,
              responseTime
            }
          }
        );
      }

      // Adicionar métricas de tempo real à resposta
      chatResponse.metadata = {
        ...chatResponse.metadata,
        responseTime
      };

      console.log('Message processed successfully:', chatResponse);

      return chatResponse;
    } catch (error) {
      console.error('Error in processMessage:', error);
      
      // Log do erro
      if (callId) {
        await logger.logEnd(
          callId,
          0,
          0,
          'error',
          {
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            additionalMetadata: { error: error?.toString() }
          }
        );
      }

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

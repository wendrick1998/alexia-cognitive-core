
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

    try {
      setProcessing(true);
      console.log(`Processing message: "${userMessage.substring(0, 100)}..."`);

      const { data, error } = await supabase.functions.invoke('process-chat-message', {
        body: { 
          user_message: userMessage.trim(),
          user_id: user.id,
          project_id: projectId,
          conversation_id: conversationId
        }
      });

      if (error) {
        console.error('Error calling process-chat-message function:', error);
        toast({
          title: "Erro no processamento",
          description: `Falha ao processar mensagem: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      const chatResponse = data as ChatResponse;
      console.log('Message processed successfully:', chatResponse);

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

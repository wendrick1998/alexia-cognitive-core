
import { useState, useCallback } from 'react';
import { useMemoryValidation } from '@/hooks/useMemoryValidation';
import { useContextThread } from '@/hooks/useContextThread';
import { useMemoryActivation } from '@/hooks/useMemoryActivation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface IntegratedMemoryResponse {
  context_used: boolean;
  contexts_found: number;
  confidence_score: number;
  validation_status: 'reliable' | 'unreliable' | 'needs_review' | 'pending';
  cognitive_contexts: any[];
  document_contexts: any[];
  memory_activated: boolean;
}

export function useIntegratedMemory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { validateMemoryConsistency } = useMemoryValidation();
  const { getContextThread } = useContextThread();
  const { saveInteractionAsMemory, boostMemoryActivation } = useMemoryActivation();

  const processMemoryForMessage = useCallback(async (
    userMessage: string,
    conversationId?: string,
    projectId?: string
  ): Promise<IntegratedMemoryResponse | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      console.log('🧠 Processando memória integrada para mensagem:', userMessage.substring(0, 50));

      // 1. Recuperar contexto cognitivo relevante
      const cognitiveContexts = await getContextThread(
        projectId,
        conversationId,
        50 // limite maior para melhor contexto
      );

      console.log(`🔍 Contextos cognitivos encontrados: ${cognitiveContexts.length}`);

      // 2. Calcular score de confiança baseado na qualidade dos contextos
      const avgConfidence = cognitiveContexts.length > 0
        ? cognitiveContexts.reduce((sum, ctx) => sum + ctx.global_confidence, 0) / cognitiveContexts.length
        : 0.5;

      // 3. Determinar status de validação
      const validationStatus = avgConfidence >= 0.8 ? 'reliable' 
        : avgConfidence >= 0.6 ? 'needs_review' 
        : 'unreliable';

      // 4. Ativar memórias relacionadas (boost)
      if (cognitiveContexts.length > 0) {
        const topContext = cognitiveContexts[0];
        await boostMemoryActivation(topContext.node_id);
      }

      // 5. Salvar interação como memória futura
      await saveInteractionAsMemory(
        userMessage,
        'note',
        {
          conversation_id: conversationId,
          project_id: projectId,
          confidence_context: avgConfidence
        }
      );

      const result: IntegratedMemoryResponse = {
        context_used: cognitiveContexts.length > 0,
        contexts_found: cognitiveContexts.length,
        confidence_score: avgConfidence,
        validation_status,
        cognitive_contexts: cognitiveContexts,
        document_contexts: [], // Será preenchido pelo chat processor
        memory_activated: true
      };

      console.log('✅ Memória integrada processada:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro no processamento de memória integrada:', error);
      toast({
        title: "Erro na Memória",
        description: "Falha ao processar contexto de memória",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getContextThread, boostMemoryActivation, saveInteractionAsMemory, toast]);

  const validateMemoryResponse = useCallback(async (
    memoryId: string
  ) => {
    return await validateMemoryConsistency(memoryId);
  }, [validateMemoryConsistency]);

  return {
    loading,
    processMemoryForMessage,
    validateMemoryResponse
  };
}


import { useCallback, useEffect, useRef } from 'react';
import { useCognitiveSystem } from '@/hooks/useCognitiveSystem';
import { useMemoryValidation } from '@/hooks/useMemoryValidation';
import { useIntegratedMemory, IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CognitiveMemoryResult {
  memoryData: IntegratedMemoryResponse | null;
  cognitiveNodes: any[];
  validationResult: any;
}

export function useCognitiveMemoryIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const cognitive = useCognitiveSystem();
  const memoryValidation = useMemoryValidation();
  const integratedMemory = useIntegratedMemory();
  
  const processingRef = useRef<Map<string, boolean>>(new Map());

  // Função principal para processar uma mensagem com memória cognitiva
  const processMessageWithCognition = useCallback(async (
    userMessage: string,
    conversationId?: string,
    projectId?: string
  ): Promise<CognitiveMemoryResult> => {
    if (!user) {
      return {
        memoryData: null,
        cognitiveNodes: [],
        validationResult: null
      };
    }

    const messageKey = `${conversationId}-${Date.now()}`;
    
    // Evitar processamento duplicado
    if (processingRef.current.get(messageKey)) {
      console.log('⚠️ Mensagem já está sendo processada:', messageKey);
      return {
        memoryData: null,
        cognitiveNodes: [],
        validationResult: null
      };
    }

    processingRef.current.set(messageKey, true);

    try {
      console.log('🧠 Iniciando processamento cognitivo para:', userMessage.substring(0, 50));

      // 1. Processar memória integrada (busca semântica + contexto)
      const memoryData = await integratedMemory.processMemoryForMessage(
        userMessage,
        conversationId,
        projectId
      );

      // 2. Buscar nós cognitivos relacionados
      const cognitiveNodes = await cognitive.cognitiveSearch(
        userMessage,
        'conceptual',
        10
      );

      // 3. Criar nó cognitivo para a mensagem do usuário
      await cognitive.createCognitiveNode(
        userMessage,
        'question',
        {
          conversation_id: conversationId,
          project_id: projectId,
          processing_timestamp: new Date().toISOString()
        },
        conversationId,
        projectId
      );

      // 4. Validar consistência da memória se encontrou contextos
      let validationResult = null;
      if (memoryData && memoryData.cognitive_contexts.length > 0) {
        const primaryContext = memoryData.cognitive_contexts[0];
        validationResult = await memoryValidation.validateMemoryConsistency(
          primaryContext.node_id
        );
      }

      console.log('✅ Processamento cognitivo concluído:', {
        memoryUsed: memoryData?.context_used,
        contextsFound: memoryData?.contexts_found,
        cognitiveNodes: cognitiveNodes.length,
        validationStatus: validationResult?.isValid
      });

      return {
        memoryData,
        cognitiveNodes,
        validationResult
      };

    } catch (error) {
      console.error('❌ Erro no processamento cognitivo:', error);
      
      toast({
        title: "Erro na Memória Cognitiva",
        description: "Falha ao processar contexto da mensagem",
        variant: "destructive",
      });

      return {
        memoryData: null,
        cognitiveNodes: [],
        validationResult: null
      };
    } finally {
      processingRef.current.delete(messageKey);
    }
  }, [user, cognitive, memoryValidation, integratedMemory, toast]);

  // Função para processar resposta da IA e criar nó cognitivo
  const processAIResponseWithCognition = useCallback(async (
    aiResponse: string,
    userMessage: string,
    conversationId?: string,
    projectId?: string,
    memoryData?: IntegratedMemoryResponse | null
  ): Promise<void> => {
    if (!user) return;

    try {
      console.log('🤖 Processando resposta da IA para memória cognitiva');

      // Criar nó cognitivo para a resposta da IA
      const aiNode = await cognitive.createCognitiveNode(
        aiResponse,
        'answer',
        {
          conversation_id: conversationId,
          project_id: projectId,
          user_question: userMessage,
          confidence_score: memoryData?.confidence_score || 0.5,
          contexts_used: memoryData?.contexts_found || 0,
          validation_status: memoryData?.validation_status || 'pending',
          processing_timestamp: new Date().toISOString()
        },
        conversationId,
        projectId
      );

      if (aiNode) {
        console.log('✅ Nó cognitivo criado para resposta da IA:', aiNode.id);
      }

    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
    }
  }, [user, cognitive]);

  // Auto-consolidação de memória (executar periodicamente)
  const triggerMemoryConsolidation = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔄 Iniciando consolidação automática de memória');
      
      // Implementar lógica de consolidação aqui
      // Por enquanto, apenas log
      console.log('🔄 Consolidação de memória completada');

    } catch (error) {
      console.error('❌ Erro na consolidação de memória:', error);
    }
  }, [user]);

  // Executar consolidação periodicamente (a cada 30 minutos)
  useEffect(() => {
    if (!user) return;

    const consolidationInterval = setInterval(() => {
      triggerMemoryConsolidation();
    }, 30 * 60 * 1000); // 30 minutos

    // Executar uma vez no mount
    setTimeout(triggerMemoryConsolidation, 5000);

    return () => clearInterval(consolidationInterval);
  }, [user, triggerMemoryConsolidation]);

  return {
    // Estados
    processing: integratedMemory.loading || cognitive.isProcessing,
    
    // Funções principais
    processMessageWithCognition,
    processAIResponseWithCognition,
    triggerMemoryConsolidation,
    
    // Acesso aos sistemas subjacentes
    cognitive,
    memoryValidation,
    integratedMemory,
    
    // Dados do estado cognitivo
    cognitiveState: cognitive.cognitiveState,
    thoughtModes: cognitive.thoughtModes
  };
}

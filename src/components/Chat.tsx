
/**
 * @modified_by Manus AI - FASE 1: Integração Completa de Memória Cognitiva
 * @date 2 de junho de 2025
 * @description Integração completa do sistema de memória cognitiva com chat
 * Inclui recuperação automática de contexto, indicadores de confiança e validação em tempo real
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useConversations } from '@/hooks/useConversations';
import { useChatProcessor } from '@/hooks/useChatProcessor';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useCognitiveMemoryIntegration } from '@/hooks/useCognitiveMemoryIntegration';
import PremiumChatLayout from './chat/PremiumChatLayout';
import FocusMode from './focus/FocusMode';
import FloatingActionButton from './chat/FloatingActionButton';
import { useIsMobile } from '@/hooks/use-mobile';
import ResponseSource from './ResponseSource';

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    currentConversation,
    messages,
    createAndNavigateToNewConversation,
    navigateToConversation,
    conversationState,
    setMessages,
    updateConversationTimestamp
  } = useConversations();

  const { processing, processMessage } = useChatProcessor();
  const { isActive: isFocusModeActive, activateFocusMode, deactivateFocusMode } = useFocusMode();
  
  // NOVA INTEGRAÇÃO: Sistema Cognitivo Completo
  const cognitiveMemory = useCognitiveMemoryIntegration();

  // Map para armazenar dados de memória por mensagem - agora melhorado
  const [cognitiveDataMap, setCognitiveDataMap] = useState<Map<string, any>>(new Map());

  // Função para scroll suave até a última mensagem
  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Scroll automático quando novas mensagens são adicionadas
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length]);

  const handleNewConversation = async () => {
    console.log('🔥 Criando nova conversa com sistema cognitivo...');
    const newConversation = await createAndNavigateToNewConversation();
    if (newConversation) {
      toast({
        title: "Nova conversa criada",
        description: "Sistema cognitivo ativado e pronto!",
      });
    }
  };

  const handleConversationSelect = async (conversation: any) => {
    console.log(`🧭 Selecionando conversa com contexto cognitivo: ${conversation.id}`);
    await navigateToConversation(conversation);
  };

  const handleSendMessage = async (message: string) => {
    if (!currentConversation) {
      console.log('⚠️ Criando nova conversa automaticamente...');
      const newConversation = await createAndNavigateToNewConversation();
      if (!newConversation) {
        toast({
          title: "Erro",
          description: "Não foi possível criar uma nova conversa",
          variant: "destructive",
        });
        return;
      }
    }

    const conversationId = currentConversation?.id;
    if (!conversationId) return;

    // Adicionar mensagem do usuário imediatamente
    const userMessage = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user' as const,
      content: message,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    scrollToBottom();

    try {
      console.log('🧠 FASE 1: Processamento Cognitivo Integrado Iniciado');

      // 1. NOVO: Processar mensagem com sistema cognitivo COMPLETO
      const cognitiveResult = await cognitiveMemory.processMessageWithCognition(
        message,
        conversationId,
        currentConversation?.project_id
      );

      console.log('🔍 Resultado do processamento cognitivo:', {
        memoryUsed: cognitiveResult.memoryData?.context_used,
        contextsFound: cognitiveResult.memoryData?.contexts_found,
        confidenceScore: cognitiveResult.memoryData?.confidence_score,
        validationStatus: cognitiveResult.memoryData?.validation_status,
        cognitiveNodes: cognitiveResult.cognitiveNodes.length
      });

      // 2. Processar mensagem com LLM (mantém compatibilidade)
      const response = await processMessage(message, conversationId);
      
      if (response) {
        const aiMessageId = `temp-ai-${Date.now()}`;
        const aiMessage = {
          id: aiMessageId,
          conversation_id: conversationId,
          role: 'assistant' as const,
          content: response.response,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            fromCache: response.metadata?.fromCache || false,
            usedFallback: response.metadata?.usedFallback || false,
            originalModel: response.metadata?.originalModel || '',
            currentModel: response.model || '',
            responseTime: response.metadata?.responseTime || 0,
            // NOVO: Dados cognitivos
            cognitiveData: cognitiveResult
          }
        };

        // 3. NOVO: Processar resposta da IA com sistema cognitivo
        await cognitiveMemory.processAIResponseWithCognition(
          response.response,
          message,
          conversationId,
          currentConversation?.project_id,
          cognitiveResult.memoryData
        );

        // 4. Armazenar dados cognitivos completos para a UI
        if (cognitiveResult.memoryData) {
          setCognitiveDataMap(prev => new Map(prev.set(aiMessageId, {
            memoryData: cognitiveResult.memoryData,
            cognitiveNodes: cognitiveResult.cognitiveNodes,
            validationResult: cognitiveResult.validationResult,
            thoughtMode: cognitiveMemory.cognitiveState.currentMode
          })));
        }

        setMessages(prev => [...prev, aiMessage]);
        await updateConversationTimestamp(conversationId);
        scrollToBottom();

        // Mostrar toast com informações cognitivas
        const memoryInfo = cognitiveResult.memoryData;
        if (memoryInfo?.context_used) {
          toast({
            title: "Resposta com Memória Cognitiva",
            description: `${memoryInfo.contexts_found} contexto(s) | ${Math.round(memoryInfo.confidence_score * 100)}% confiança | Status: ${memoryInfo.validation_status}`,
          });
        } else {
          toast({
            title: "Resposta gerada",
            description: "Nova informação adicionada à memória cognitiva",
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro no processamento cognitivo completo:', error);
      toast({
        title: "Erro",
        description: "Falha no sistema cognitivo integrado",
        variant: "destructive",
      });
    }
  };

  const handleFloatingAction = (action: string) => {
    switch (action) {
      case 'new-chat':
        handleNewConversation();
        break;
      case 'focus-mode':
        activateFocusMode();
        toast({
          title: "Focus Mode Ativado",
          description: "Modo de escrita com memória cognitiva ativa",
        });
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  };

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleNewConversation();
            break;
          case 'f':
            e.preventDefault();
            activateFocusMode();
            break;
        }
      }
      
      if (e.key === 'Escape' && isFocusModeActive) {
        deactivateFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [isFocusModeActive, deactivateFocusMode, activateFocusMode]);

  const renderMessageWithSource = (message: any) => {
    if (message.role !== 'assistant' || !message.metadata) {
      return null;
    }
    
    return (
      <ResponseSource 
        fromCache={message.metadata.fromCache}
        usedFallback={message.metadata.usedFallback}
        originalModel={message.metadata.originalModel}
        currentModel={message.metadata.currentModel}
        responseTime={message.metadata.responseTime}
      />
    );
  };

  console.log('🗨️ Chat FASE 1 renderizado com sistema cognitivo completo:', {
    conversations: conversations.length,
    currentConversation: currentConversation?.id,
    messages: messages.length,
    cognitiveDataEntries: cognitiveDataMap.size,
    processing: processing || cognitiveMemory.processing,
    cognitiveState: cognitiveMemory.cognitiveState.currentMode.type
  });

  return (
    <>
      <div className="h-full relative">
        <PremiumChatLayout
          conversations={conversations}
          currentConversation={currentConversation}
          messages={messages}
          processing={processing || cognitiveMemory.processing}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          onSendMessage={handleSendMessage}
          isCreatingNew={conversationState.isCreatingNew}
          isNavigating={conversationState.isNavigating}
          renderMessageExtras={renderMessageWithSource}
          memoryDataMap={cognitiveDataMap}
          className="messages-container"
        />

        <div ref={messagesEndRef} />

        {isMobile && (
          <FloatingActionButton 
            onAction={(action) => {
              switch (action) {
                case 'new-chat':
                  handleNewConversation();
                  break;
                case 'focus-mode':
                  activateFocusMode();
                  break;
              }
            }}
            currentSection="chat"
            hasActiveChat={!!currentConversation}
            hasDocument={false}
            className="touch-target"
          />
        )}
      </div>

      <FocusMode
        isActive={isFocusModeActive}
        onExit={deactivateFocusMode}
        onSendMessage={handleSendMessage}
        initialText=""
      />
    </>
  );
};

export default Chat;

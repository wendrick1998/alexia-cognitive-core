/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Correção de alinhamentos e padronização de espaçamentos no componente Chat
 * Implementa tokens de espaçamento e melhora consistência visual
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useConversations } from '@/hooks/useConversations';
import { useChatProcessor } from '@/hooks/useChatProcessor';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useIntegratedMemory, IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
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
  const { processMemoryForMessage } = useIntegratedMemory();

  // Map para armazenar dados de memória por mensagem
  const [memoryDataMap, setMemoryDataMap] = useState<Map<string, IntegratedMemoryResponse>>(new Map());

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
    console.log('🔥 Criando nova conversa...');
    const newConversation = await createAndNavigateToNewConversation();
    if (newConversation) {
      toast({
        title: "Nova conversa criada",
        description: "Conversa pronta para uso!",
      });
    }
  };

  const handleConversationSelect = async (conversation: any) => {
    console.log(`🧭 Selecionando conversa: ${conversation.id}`);
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
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user' as const,
      content: message,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    scrollToBottom();

    try {
      // 1. Processar memória ANTES de enviar para o LLM
      console.log('🧠 Processando memória integrada...');
      const memoryData = await processMemoryForMessage(
        message,
        conversationId,
        currentConversation?.project_id
      );

      // 2. Processar mensagem com LLM
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
            responseTime: response.metadata?.responseTime || 0
          }
        };

        // 3. Armazenar dados de memória para a resposta
        if (memoryData) {
          const updatedMemoryData = {
            ...memoryData,
            document_contexts: [], // TODO: Integrar com documentos do response
            contexts_found: memoryData.contexts_found + (response.chunks_found || 0)
          };
          
          setMemoryDataMap(prev => new Map(prev.set(aiMessageId, updatedMemoryData)));
        }

        setMessages(prev => [...prev, aiMessage]);
        await updateConversationTimestamp(conversationId);
        scrollToBottom();

        toast({
          title: "Mensagem enviada",
          description: memoryData?.context_used 
            ? `IA respondeu com ${memoryData.contexts_found} contexto(s)` 
            : "IA respondeu",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
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
          description: "Modo de escrita minimalista ativado",
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

  console.log('🗨️ Chat renderizado com memória integrada:', {
    conversations: conversations.length,
    currentConversation: currentConversation?.id,
    messages: messages.length,
    memoryDataEntries: memoryDataMap.size,
    processing
  });

  return (
    <>
      <div className="h-full relative">
        <PremiumChatLayout
          conversations={conversations}
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          onSendMessage={handleSendMessage}
          isCreatingNew={conversationState.isCreatingNew}
          isNavigating={conversationState.isNavigating}
          renderMessageExtras={renderMessageWithSource}
          memoryDataMap={memoryDataMap}
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


/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Reestruturação completa para UI premium, harmoniosa e responsiva
 * Implementa design system unificado e experiência de usuário otimizada
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useConversations } from '@/hooks/useConversations';
import { useChatProcessor } from '@/hooks/useChatProcessor';
import { useFocusMode } from '@/hooks/useFocusMode';
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

  // Scroll otimizado para experiência premium
  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

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
      const response = await processMessage(message, conversationId);
      
      if (response) {
        const fromCache = response.metadata?.fromCache || false;
        const usedFallback = response.metadata?.usedFallback || false;
        const originalModel = response.metadata?.originalModel || '';
        const responseTime = response.metadata?.responseTime || 0;
        
        const aiMessage = {
          id: `temp-ai-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant' as const,
          content: response.response,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            fromCache,
            usedFallback,
            originalModel,
            currentModel: response.model || '',
            responseTime
          }
        };

        setMessages(prev => [...prev, aiMessage]);
        await updateConversationTimestamp(conversationId);
        scrollToBottom();

        toast({
          title: "Mensagem enviada",
          description: response.context_used ? "IA respondeu com contexto" : "IA respondeu",
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

  // Keyboard shortcuts otimizados
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

  return (
    <>
      {/* Container premium com overscroll controlado */}
      <div className="h-full flex flex-col bg-background overscroll-contain">
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
          className="flex-1 overflow-hidden"
        />

        {/* Scroll reference - invisível */}
        <div ref={messagesEndRef} />

        {/* Floating Action Button - Mobile Premium */}
        {isMobile && (
          <FloatingActionButton 
            onAction={handleFloatingAction}
            currentSection="chat"
            hasActiveChat={!!currentConversation}
            hasDocument={false}
            className="fixed bottom-20 right-4 z-40 shadow-xl"
          />
        )}
      </div>

      {/* Focus Mode Premium */}
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

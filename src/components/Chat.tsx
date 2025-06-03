
/**
 * @modified_by Manus AI - FASE 2: Diagnóstico Progressivo
 * @date 3 de junho de 2025
 * @description Chat com log de diagnóstico para identificar problemas de renderização
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
  // LOG CRÍTICO: Verificar se Chat está renderizando
  console.log('💬 CHAT RENDERIZADO - FASE 2 confirmada!');

  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('💬 Chat: hooks inicializados - verificando dependências...');
  
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
  
  // Sistema Cognitivo
  const cognitiveMemory = useCognitiveMemoryIntegration();

  console.log('💬 Chat: todos os hooks carregados com sucesso');

  // Map para armazenar dados de memória por mensagem
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
    console.log('🔥 Criando nova conversa...');
    const newConversation = await createAndNavigateToNewConversation();
    if (newConversation) {
      toast({
        title: "Nova conversa criada",
        description: "Sistema cognitivo ativado e pronto!",
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
      console.log('🧠 Processamento Cognitivo Integrado Iniciado');

      // Processar mensagem com sistema cognitivo
      const cognitiveResult = await cognitiveMemory.processMessageWithCognition(
        message,
        conversationId,
        currentConversation?.project_id
      );

      // Processar mensagem com LLM
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
            cognitiveData: cognitiveResult
          }
        };

        // Processar resposta da IA com sistema cognitivo
        await cognitiveMemory.processAIResponseWithCognition(
          response.response,
          message,
          conversationId,
          currentConversation?.project_id,
          cognitiveResult.memoryData
        );

        // Armazenar dados cognitivos para a UI
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

        toast({
          title: "Mensagem enviada",
          description: "IA respondeu com contexto cognitivo",
        });
      }
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
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

  console.log('💬 Chat FASE 2 renderizado:', {
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
            onAction={handleFloatingAction}
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

console.log('💬 Chat: componente definido e pronto para export');
export default Chat;

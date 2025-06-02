/**
 * @modified_by Manus AI
 * @date 2 de junho de 2025
 * @description Chat aprimorado com sidebar recolhível e navegação inferior fixa
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useConversations } from '@/hooks/useConversations';
import { useChatProcessor } from '@/hooks/useChatProcessor';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import PremiumChatLayout from './chat/PremiumChatLayout';
import FocusMode from './focus/FocusMode';
import FloatingActionButton from './chat/FloatingActionButton';
import ResponseSource from './ResponseSource';
import { cn } from '@/lib/utils';

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estado da sidebar recolhível
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  
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

  // Auto-colapsar sidebar no mobile
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);

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
    // Auto-colapsar sidebar no mobile após seleção
    if (isMobile) {
      setSidebarCollapsed(true);
    }
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
      case 'toggle-sidebar':
        setSidebarCollapsed(!sidebarCollapsed);
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  };

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
      {/* Container principal com padding para barra inferior */}
      <div className="h-full relative flex" style={{ paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : '0px' }}>
        
        {/* Botão Toggle Sidebar - Flutuante no mobile */}
        {isMobile && (
          <Button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant="outline"
            size="icon"
            className={cn(
              "fixed top-20 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-300",
              sidebarCollapsed ? "left-4" : "left-80"
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}

        {/* Layout responsivo com sidebar recolhível */}
        <div className={cn(
          "flex w-full h-full transition-all duration-300 ease-in-out",
          sidebarCollapsed && !isMobile && "ml-16" // Espaço mínimo no desktop
        )}>
          
          {/* Sidebar Desktop Toggle */}
          {!isMobile && (
            <div className={cn(
              "fixed left-0 top-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 z-40",
              sidebarCollapsed ? "w-16" : "w-80"
            )}>
              {sidebarCollapsed ? (
                // Sidebar colapsada - apenas ícone
                <div className="p-4 h-full flex flex-col items-center">
                  <Button
                    onClick={() => setSidebarCollapsed(false)}
                    variant="ghost"
                    size="icon"
                    className="mb-4 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleNewConversation}
                    variant="outline"
                    size="icon"
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                // Sidebar expandida - lista completa
                <div className="h-full">
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="font-semibold text-gray-900 dark:text-gray-100">Conversas</h2>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleNewConversation}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setSidebarCollapsed(true)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Área principal do chat */}
          <div className={cn(
            "flex-1 h-full",
            !isMobile && !sidebarCollapsed && "ml-80",
            !isMobile && sidebarCollapsed && "ml-16"
          )}>
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
              className="h-full"
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        </div>

        <div ref={messagesEndRef} />

        {/* Floating Action Button - Mobile */}
        {isMobile && (
          <FloatingActionButton 
            onAction={handleFloatingAction}
            currentSection="chat"
            hasActiveChat={!!currentConversation}
            hasDocument={false}
            className="bottom-20"
          />
        )}
      </div>

      {/* Focus Mode Overlay */}
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

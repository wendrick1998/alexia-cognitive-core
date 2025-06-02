
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

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
        handleToggleSidebar();
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
    <div className="h-full relative flex overflow-hidden">
      {/* Botão Toggle Sidebar - Melhorado visualmente */}
      {isMobile && (
        <Button
          onClick={handleToggleSidebar}
          variant="outline"
          size="icon"
          className={cn(
            "fixed top-20 z-50 transition-all duration-300 shadow-lg",
            "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
            "hover:shadow-xl transform hover:scale-105",
            sidebarCollapsed ? "left-4" : "left-80"
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      )}

      {/* Layout principal do chat com overflow controlado */}
      <div className="flex-1 h-full overflow-hidden">
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
          onToggleSidebar={handleToggleSidebar}
        />
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

      {/* Focus Mode Overlay */}
      <FocusMode
        isActive={isFocusModeActive}
        onExit={deactivateFocusMode}
        onSendMessage={handleSendMessage}
        initialText=""
      />
    </div>
  );
};

export default Chat;

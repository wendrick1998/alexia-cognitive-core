
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
  const messagesEndRef = useRef(null);

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
  const { isActive, activateFocusMode, deactivateFocusMode } = useFocusMode();
  const cognitiveMemory = useCognitiveMemoryIntegration();

  const [cognitiveDataMap, setCognitiveDataMap] = useState(new Map());

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  const handleNewConversation = async () => {
    try {
      await createAndNavigateToNewConversation();
      toast({
        title: "Nova conversa criada",
        description: "Comece uma nova conversa com Alex IA",
      });
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao criar nova conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova conversa",
        variant: "destructive",
      });
    }
  };

  const handleConversationSelect = async (conversation) => {
    try {
      await navigateToConversation(conversation.id);
      if (isMobile && window.innerWidth < 768) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Erro ao selecionar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a conversa",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || processing) return;

    try {
      await processMessage(message, currentConversation?.id);
      updateConversationTimestamp();
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const handleFloatingAction = (action) => {
    switch (action) {
      case 'new-conversation':
        handleNewConversation();
        break;
      case 'focus-mode':
        if (isActive) {
          deactivateFocusMode();
        } else {
          activateFocusMode();
        }
        break;
      case 'voice-input':
        toast({
          title: "Voice Input",
          description: "Funcionalidade em desenvolvimento",
        });
        break;
      default:
        break;
    }
  };

  const renderMessageWithSource = (message) => {
    const cognitiveData = cognitiveDataMap.get(message.id);
    
    return (
      <div key={message.id} className="space-y-2">
        <div className="message-content">
          {message.content}
        </div>
        {cognitiveData && (
          <ResponseSource
            memories={cognitiveData.memories || []}
            documents={cognitiveData.documents || []}
            searchResults={cognitiveData.searchResults || []}
            reasoning={cognitiveData.reasoning}
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isActive) {
        deactivateFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, deactivateFocusMode]);

  if (isActive) {
    return (
      <FocusMode
        onExit={deactivateFocusMode}
        currentConversation={currentConversation}
        onSendMessage={handleSendMessage}
        processing={processing}
      />
    );
  }

  return (
    <div className="h-full relative">
      <PremiumChatLayout
        conversations={conversations}
        currentConversation={currentConversation}
        messages={messages}
        onNewConversation={handleNewConversation}
        onConversationSelect={handleConversationSelect}
        onSendMessage={handleSendMessage}
        processing={processing}
        conversationState={conversationState}
        renderMessage={renderMessageWithSource}
      />
      
      <FloatingActionButton
        onAction={handleFloatingAction}
        processing={processing}
        focusMode={isActive}
      />
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Chat;

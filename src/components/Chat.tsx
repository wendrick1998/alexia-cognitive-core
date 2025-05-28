
import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatProcessor } from "@/hooks/useChatProcessor";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import { ChatLoadingSkeleton } from "./chat/ChatSkeleton";

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    currentConversation, 
    messages, 
    loading, 
    conversationState,
    createAndNavigateToNewConversation,
    loadMessages,
    updateConversationTimestamp,
  } = useConversations();
  
  const { processing, processMessage } = useChatProcessor();

  // Efeito otimizado para carregamento de mensagens
  useEffect(() => {
    const loadConversationMessages = async () => {
      if (currentConversation?.id && !conversationState.isNavigating) {
        console.log(`🔄 Carregando mensagens da conversa: ${currentConversation.id}`);
        await loadMessages(currentConversation.id);
      }
    };
    
    loadConversationMessages();
  }, [currentConversation?.id, loadMessages, conversationState.isNavigating]);

  const handleSendMessage = async (messageText: string) => {
    let conversation = currentConversation;
    
    // Se não há conversa atual, criar uma nova automaticamente
    if (!conversation) {
      conversation = await createAndNavigateToNewConversation();
      if (!conversation) return;
    }

    const response = await processMessage(messageText, conversation.id);
    
    if (response) {
      await updateConversationTimestamp(conversation.id);
      // Recarregar mensagens para mostrar a nova interação
      await loadMessages(conversation.id);
    }
  };

  const handleNewConversation = async () => {
    console.log(`🆕 Iniciando nova conversa premium...`);
    await createAndNavigateToNewConversation();
  };

  // Estados de carregamento com UX premium
  const isLoadingState = loading || conversationState.isNavigating || conversationState.isLoadingMessages;

  return (
    <div className="flex-1 flex bg-gradient-to-br from-slate-50 via-white to-blue-50/30 min-h-screen">
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col relative">
        <ChatHeader
          currentConversation={currentConversation}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewConversation={handleNewConversation}
          isCreatingNew={conversationState.isCreatingNew}
          isNavigating={conversationState.isNavigating}
        />

        {isLoadingState ? (
          <ChatLoadingSkeleton />
        ) : (
          <ChatMessages
            messages={messages}
            loading={false}
            processing={processing}
          />
        )}

        <ChatInput
          processing={processing || conversationState.isCreatingNew}
          currentConversation={currentConversation}
          onSendMessage={handleSendMessage}
          placeholder={
            conversationState.isCreatingNew 
              ? "Iniciando nova conversa..." 
              : "Faça uma pergunta sobre seus documentos..."
          }
        />
      </div>
    </div>
  );
};

export default Chat;

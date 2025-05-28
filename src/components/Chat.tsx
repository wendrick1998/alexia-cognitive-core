
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

  const handleSendMessage = async (messageText: string) => {
    let conversation = currentConversation;
    
    // Se não há conversa atual, criar uma nova automaticamente
    if (!conversation) {
      console.log('🔥 Nenhuma conversa ativa, criando nova...');
      conversation = await createAndNavigateToNewConversation();
      if (!conversation) {
        console.error('❌ Falha ao criar conversa para enviar mensagem');
        return;
      }
    }

    console.log(`📤 Enviando mensagem para conversa: ${conversation.id}`);
    const response = await processMessage(messageText, conversation.id);
    
    if (response) {
      await updateConversationTimestamp(conversation.id);
      // Recarregar mensagens para mostrar a nova interação
      await loadMessages(conversation.id);
    }
  };

  // ✅ FUNÇÃO PRINCIPAL - Nova Conversa Premium
  const handleNewConversation = async () => {
    console.log('🆕 NOVA CONVERSA SOLICITADA - UX PREMIUM');
    const newConversation = await createAndNavigateToNewConversation();
    
    if (newConversation) {
      console.log('🎯 Nova conversa criada e ativa, pronta para primeira mensagem!');
    }
  };

  // Estados de carregamento otimizados
  const isLoadingState = loading || conversationState.isNavigating || conversationState.isLoadingMessages;
  const isCreatingNew = conversationState.isCreatingNew;

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
          isCreatingNew={isCreatingNew}
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
          processing={processing || isCreatingNew}
          currentConversation={currentConversation}
          onSendMessage={handleSendMessage}
          placeholder={
            isCreatingNew 
              ? "Criando nova conversa..." 
              : currentConversation 
                ? "Digite sua mensagem..."
                : "Comece uma nova conversa..."
          }
        />
      </div>
    </div>
  );
};

export default Chat;

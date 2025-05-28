
import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatProcessor } from "@/hooks/useChatProcessor";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { 
    currentConversation, 
    messages, 
    loading, 
    createConversation,
    getCurrentOrCreateConversation,
    loadMessages,
    updateConversationTimestamp,
    setCurrentConversation,
    setMessages
  } = useConversations();
  
  const { processing, processMessage } = useChatProcessor();

  // Carregar mensagens sempre que a conversa atual mudar
  useEffect(() => {
    const loadConversationMessages = async () => {
      if (currentConversation?.id) {
        console.log(`🔄 Carregando mensagens da conversa: ${currentConversation.id}`);
        await loadMessages(currentConversation.id);
      }
    };
    
    loadConversationMessages();
  }, [currentConversation?.id, loadMessages]);

  const handleSendMessage = async (messageText: string) => {
    const conversation = await getCurrentOrCreateConversation();
    if (!conversation) return;

    const response = await processMessage(messageText, conversation.id);
    
    if (response) {
      await updateConversationTimestamp(conversation.id);
      // Recarregar mensagens para mostrar a nova interação
      await loadMessages(conversation.id);
    }
  };

  const handleNewConversation = async () => {
    console.log(`🆕 Iniciando nova conversa - limpando contexto atual`);
    // Limpar estado atual
    setCurrentConversation(null);
    setMessages([]);
    
    // Criar nova conversa
    const newConversation = await createConversation();
    if (newConversation) {
      console.log(`✅ Nova conversa criada: ${newConversation.id}`);
    }
  };

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
        />

        <ChatMessages
          messages={messages}
          loading={loading}
          processing={processing}
        />

        <ChatInput
          processing={processing}
          currentConversation={currentConversation}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;

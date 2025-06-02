
import { useState, useEffect, useRef } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import ChatWelcome from "./chat/ChatWelcome";
import ChatHeader from "./chat/ChatHeader";
import { ConnectionStatus } from "./ui/connection-status";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MobileScrollWrapper } from "./layout/MobileScrollWrapper";

const Chat = () => {
  const { user } = useAuth();
  const {
    messages,
    currentConversation,
    conversations,
    loading,
    createAndNavigateToNewConversation,
    setCurrentConversation
  } = useConversations();

  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || processing) return;

    setProcessing(true);

    try {
      // Process message logic here
      console.log("Sending message:", message);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewChat = async () => {
    try {
      await createAndNavigateToNewConversation();
    } catch (error) {
      console.error("Erro ao criar nova conversa:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Faça login para acessar o chat</p>
      </div>
    );
  }

  // 🚫 SEM BOUNCE SCROLL - Wrapper específico para mobile
  const ChatContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 overscroll-contain">
      {/* Header */}
      <div className="flex-shrink-0">
        <ChatHeader 
          currentConversation={currentConversation}
          isMobile={isMobile}
        />
      </div>

      {/* Messages Area with Controlled Scroll */}
      <div className="flex-1 overflow-hidden">
        <div className={cn(
          "h-full overflow-y-auto overscroll-contain",
          "premium-scrollbar momentum-scroll chat-messages-container"
        )}>
          <div className="h-full flex flex-col">
            {messages.length === 0 ? (
              <ChatWelcome />
            ) : (
              <div className="flex-1 px-4 py-6">
                <ChatMessages 
                  messages={messages} 
                  loading={loading}
                  processing={processing}
                />
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area with Mobile Safe Area */}
      <div className={cn(
        "flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950",
        isMobile ? "chat-input-container" : ""
      )}>
        <div className="p-4">
          <ChatInput
            processing={processing}
            currentConversation={currentConversation}
            onSendMessage={handleSendMessage}
            placeholder="Digite sua mensagem..."
          />
        </div>
      </div>

      <ConnectionStatus />
    </div>
  );

  // Renderizar com wrapper mobile ou sem wrapper para desktop
  return isMobile ? (
    <MobileScrollWrapper className="h-full">
      <ChatContent />
    </MobileScrollWrapper>
  ) : (
    <ChatContent />
  );
};

export default Chat;

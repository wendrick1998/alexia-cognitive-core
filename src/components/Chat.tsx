
import { useState, useEffect, useRef } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import ChatWelcome from "./chat/ChatWelcome";
import ChatHeader from "./chat/ChatHeader";
import { ConnectionStatus } from "./ui/connection-status";

const Chat = () => {
  const { user } = useAuth();
  const {
    messages,
    currentConversation,
    conversations,
    processing,
    createConversation,
    setCurrentConversation
  } = useConversations();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || processing) return;

    const messageContent = inputValue.trim();
    setInputValue("");

    try {
      // Process message logic here
      console.log("Sending message:", messageContent);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      await createConversation();
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0">
        <ChatHeader 
          currentConversation={currentConversation}
          isMobile={false}
        />
      </div>

      {/* Messages Area with Scroll */}
      <div className="flex-1 overflow-y-auto premium-scrollbar momentum-scroll">
        <div className="h-full flex flex-col">
          {messages.length === 0 ? (
            <ChatWelcome />
          ) : (
            <div className="flex-1 px-4 py-6">
              <ChatMessages 
                messages={messages} 
                loading={processing}
                currentConversation={currentConversation}
              />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="p-4">
          <ChatInput
            message={inputValue}
            setMessage={setInputValue}
            onSend={handleSendMessage}
            disabled={processing}
            placeholder="Digite sua mensagem..."
          />
        </div>
      </div>

      <ConnectionStatus />
    </div>
  );
};

export default Chat;

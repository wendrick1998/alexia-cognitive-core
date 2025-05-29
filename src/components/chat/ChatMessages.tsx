
import { useRef, useEffect } from "react";
import { Message } from "@/hooks/useConversations";
import ChatWelcome from "./ChatWelcome";
import MessageCard from "./MessageCard";
import ChatLoadingIndicator from "./ChatLoadingIndicator";
import ChatProcessingIndicator from "./ChatProcessingIndicator";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  processing: boolean;
}

const ChatMessages = ({ messages, loading, processing }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll automático quando novas mensagens chegam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100); // Pequeno delay para garantir que a mensagem foi renderizada

    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  // Scroll automático quando o processing muda
  useEffect(() => {
    if (processing) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [processing]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto min-h-0"
    >
      <div className="p-6 space-y-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-transparent pointer-events-none" />
        
        {messages.length === 0 && !loading && <ChatWelcome />}

        {loading && <ChatLoadingIndicator />}

        {messages.map((message, index) => (
          <MessageCard key={message.id} message={message} index={index} />
        ))}

        {processing && <ChatProcessingIndicator />}

        {/* Elemento para scroll automático */}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
};

export default ChatMessages;

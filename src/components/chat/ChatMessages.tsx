
import { useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { Message } from "@/hooks/useConversations";
import ChatWelcome from "./ChatWelcome";
import MessageCard from "./MessageCard";

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  processing: boolean;
}

const ChatMessages = ({ messages, loading, processing }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-transparent pointer-events-none" />
      
      {messages.length === 0 && !loading && <ChatWelcome />}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Carregando conversa...</p>
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageCard key={message.id} message={message} index={index} />
      ))}

      {processing && (
        <div className="flex items-start space-x-4 max-w-5xl mx-auto animate-fade-in">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="max-w-3xl px-6 py-4 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-base text-slate-700 font-medium">
                Processando sua pergunta e buscando informações relevantes...
              </p>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;

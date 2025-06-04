
import React from 'react';
import { Conversation, Message } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';

interface ChatContentProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  isNavigating?: boolean;
}

const ChatContent = ({
  currentConversation,
  messages,
  processing,
  isNavigating
}: ChatContentProps) => {
  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white/60">
          <Bot className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h3 className="text-xl font-semibold mb-2">Bem-vindo ao Alex IA</h3>
          <p>Selecione uma conversa ou inicie uma nova para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !processing && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white/60">
            <Bot className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <p>Envie uma mensagem para começar a conversa</p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <Card className={`max-w-[80%] p-4 ${
            message.role === 'user' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white/10 text-white border-white/20'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm">{message.content}</p>
                {message.metadata && (
                  <div className="mt-2 text-xs opacity-60">
                    {message.metadata.usedFallback && (
                      <span className="mr-2">🔄 Fallback</span>
                    )}
                    {message.metadata.responseTime && (
                      <span>{Math.round(message.metadata.responseTime)}ms</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ))}

      {processing && (
        <div className="flex justify-start">
          <Card className="bg-white/10 text-white border-white/20 p-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-blue-400" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm">Alex está pensando...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatContent;

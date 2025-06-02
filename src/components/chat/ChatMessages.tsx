
import { useRef, useEffect } from 'react';
import { Message } from '@/hooks/useConversations';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  processing: boolean;
  loading?: boolean;
  renderMessageExtras?: (message: Message) => React.ReactNode;
}

const ChatMessages = ({ messages, processing, loading = false, renderMessageExtras }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Auto-scroll quando mensagens mudam ou processamento
  useEffect(() => {
    if (messages.length > 0) {
      // Delay pequeno para garantir que o DOM foi atualizado
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length, processing]);

  // Auto-scroll quando carrega conversa existente
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      // Scroll imediato ao carregar conversa existente
      setTimeout(() => scrollToBottom('auto'), 50);
    }
  }, [messages.length, loading]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Carregando mensagens...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden chat-scroll-container premium-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <div className="p-4 space-y-4 min-h-full pb-safe-bottom-nav">
        {messages.map((message, index) => (
          <div key={message.id} className="space-y-2">
            <MessageBubble message={message} />
            {renderMessageExtras && renderMessageExtras(message)}
          </div>
        ))}
        
        {processing && (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>IA está pensando...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
};

export default ChatMessages;

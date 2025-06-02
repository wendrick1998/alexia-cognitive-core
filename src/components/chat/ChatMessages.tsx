
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processing]);

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
      className="h-full overflow-y-auto overflow-x-hidden premium-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
        overscrollBehavior: 'contain' // Prevent pull-to-refresh
      }}
    >
      <div className="p-4 space-y-4 min-h-full">
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

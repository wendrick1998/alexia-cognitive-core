
import { useRef, useEffect, useCallback } from 'react';
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
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'smooth') => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        try {
          messagesEndRef.current.scrollIntoView({ 
            behavior, 
            block: 'end',
            inline: 'nearest'
          });
        } catch (error) {
          console.warn('Scroll error:', error);
        }
      }
    }, 100);
  }, []);

  // Auto-scroll when messages change or processing
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, processing, scrollToBottom]);

  // Auto-scroll immediately when loading existing conversation
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      scrollToBottom('auto');
    }
  }, [messages.length, loading, scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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
      className="h-full overflow-y-auto overflow-x-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollBehavior: 'smooth'
      }}
    >
      <div className="pb-48 md:pb-32">
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
    </div>
  );
};

export default ChatMessages;

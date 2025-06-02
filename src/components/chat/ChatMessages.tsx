
import { useRef, useEffect } from 'react';
import { Message } from '@/hooks/useConversations';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  processing: boolean;
  renderMessageExtras?: (message: Message) => React.ReactNode;
}

const ChatMessages = ({ messages, processing, renderMessageExtras }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processing]);

  return (
    <div className="p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={message.id} className="space-y-2">
          <MessageBubble message={message} />
          {renderMessageExtras && renderMessageExtras(message)}
        </div>
      ))}
      
      {processing && (
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>IA está pensando...</span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;

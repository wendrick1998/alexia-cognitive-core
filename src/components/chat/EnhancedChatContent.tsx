
import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation, Message } from '@/hooks/useConversations';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MessageWithMemory from './MessageWithMemory';
import ChatWelcome from './ChatWelcome';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';

interface EnhancedChatContentProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  isNavigating?: boolean;
  memoryDataMap?: Map<string, IntegratedMemoryResponse>;
  renderMessageExtras?: (message: Message) => React.ReactNode;
}

const EnhancedChatContent = ({
  currentConversation,
  messages,
  processing,
  isNavigating = false,
  memoryDataMap = new Map(),
  renderMessageExtras
}: EnhancedChatContentProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isNavigating) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando conversa...</span>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="max-w-4xl mx-auto py-6">
        {messages.length === 0 ? (
          <ChatWelcome />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageWithMemory
                key={message.id}
                message={message}
                memoryData={memoryDataMap.get(message.id)}
                renderExtras={renderMessageExtras}
              />
            ))}
            
            {processing && (
              <div className="flex items-start gap-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processando com memória cognitiva...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default EnhancedChatContent;

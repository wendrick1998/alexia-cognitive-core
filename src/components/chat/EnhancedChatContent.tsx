
import React, { useMemo } from 'react';
import { Conversation, Message } from '@/hooks/useConversations';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import ChatMessages from './ChatMessages';
import ChatWelcome from './ChatWelcome';
import { cn } from '@/lib/utils';

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
  // Memoize expensive calculations
  const processedMessages = useMemo(() => {
    return messages.map(message => ({
      ...message,
      memoryData: memoryDataMap.get(message.id),
      extras: renderMessageExtras ? renderMessageExtras(message) : null
    }));
  }, [messages, memoryDataMap, renderMessageExtras]);

  const hasMessages = messages.length > 0;

  console.log('🎨 EnhancedChatContent com otimizações:', {
    conversation: currentConversation?.id,
    messages: messages.length,
    memoryEntries: memoryDataMap.size,
    processing,
    isNavigating
  });

  if (isNavigating) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Carregando conversa...
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 min-h-0 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950",
      "transition-all duration-300 ease-in-out"
    )}>
      {hasMessages ? (
        <ChatMessages
          messages={processedMessages}
          processing={processing}
        />
      ) : (
        <ChatWelcome currentConversation={currentConversation} />
      )}
    </div>
  );
};

export default React.memo(EnhancedChatContent);


import { useMemo, memo, useCallback } from "react";
import { Message } from "@/hooks/useConversations";
import ChatWelcome from "./ChatWelcome";
import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import ChatLoadingIndicator from "./ChatLoadingIndicator";
import ChatProcessingIndicator from "./ChatProcessingIndicator";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { isSameDay } from 'date-fns';

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  processing: boolean;
}

// Função para agrupar mensagens por data
const groupMessagesByDate = (messages: Message[]) => {
  const groups: { date: Date; messages: Message[] }[] = [];
  
  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const lastGroup = groups[groups.length - 1];
    
    if (!lastGroup || !isSameDay(lastGroup.date, messageDate)) {
      groups.push({
        date: messageDate,
        messages: [message]
      });
    } else {
      lastGroup.messages.push(message);
    }
  });
  
  return groups;
};

const ChatMessages = memo(({ messages, loading, processing }: ChatMessagesProps) => {
  const { scrollRef } = useAutoScroll({
    dependency: [messages.length, processing],
    delay: 50
  });

  // Memoizar o agrupamento de mensagens por data
  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

  // Memoizar o callback para evitar re-renderizações
  const renderMessageBubble = useCallback((message: Message, isLastOverall: boolean) => (
    <MessageBubble
      key={message.id}
      message={message}
      isLast={isLastOverall}
    />
  ), []);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      <div className="p-4 pb-8 min-h-full relative">
        {/* Welcome screen quando não há mensagens */}
        {messages.length === 0 && !loading && <ChatWelcome />}

        {/* Loading indicator */}
        {loading && <ChatLoadingIndicator />}

        {/* Grupos de mensagens por data */}
        {messageGroups.map((group, groupIndex) => (
          <div key={`group-${group.date.getTime()}`} className="relative">
            {/* Separador de data */}
            <DateSeparator date={group.date} />
            
            {/* Mensagens do grupo */}
            {group.messages.map((message, messageIndex) => {
              const isLastInGroup = messageIndex === group.messages.length - 1;
              const isLastOverall = groupIndex === messageGroups.length - 1 && isLastInGroup;
              
              return renderMessageBubble(message, isLastOverall);
            })}
          </div>
        ))}

        {/* Processing indicator */}
        {processing && (
          <div className="relative z-10">
            <ChatProcessingIndicator />
          </div>
        )}

        {/* Elemento para scroll automático */}
        <div ref={scrollRef} className="h-1 relative z-0" />
      </div>
    </div>
  );
});

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;

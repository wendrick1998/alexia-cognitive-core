
import { Conversation, Message } from '@/hooks/useConversations';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import ChatHeader from './ChatHeader';
import EnhancedChatContent from './EnhancedChatContent';
import ChatInputArea from './ChatInputArea';

interface ChatAreaProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  onSendMessage: (message: string) => void;
  onBackToConversations?: () => void;
  isMobile: boolean;
  isNavigating?: boolean;
  renderMessageExtras?: (message: Message) => React.ReactNode;
  memoryDataMap?: Map<string, IntegratedMemoryResponse>;
}

const ChatArea = ({ 
  currentConversation, 
  messages,
  processing,
  onSendMessage,
  onBackToConversations, 
  isMobile,
  isNavigating = false,
  renderMessageExtras,
  memoryDataMap = new Map()
}: ChatAreaProps) => {
  console.log('🎨 ChatArea renderizado com memória:', {
    conversation: currentConversation?.id,
    messages: messages.length,
    memoryEntries: memoryDataMap.size,
    processing,
    isNavigating
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 border-b border-gray-200/50 dark:border-gray-700/50">
        <ChatHeader
          currentConversation={currentConversation}
          onBackToConversations={onBackToConversations}
          isMobile={isMobile}
          isNavigating={isNavigating}
        />
      </div>

      {/* Content Area - Enhanced with memory integration */}
      <EnhancedChatContent
        currentConversation={currentConversation}
        messages={messages}
        processing={processing}
        isNavigating={isNavigating}
        memoryDataMap={memoryDataMap}
        renderMessageExtras={renderMessageExtras}
      />

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInputArea
          processing={processing}
          onSendMessage={onSendMessage}
          currentConversation={currentConversation}
        />
      </div>
    </div>
  );
};

export default ChatArea;


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
  return (
    <div className="h-full flex flex-col bg-transparent relative overscroll-contain">
      {/* Header Premium - Glassmorphism */}
      <div className="flex-shrink-0 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <ChatHeader
          currentConversation={currentConversation}
          onBackToConversations={onBackToConversations}
          isMobile={isMobile}
          isNavigating={isNavigating}
        />
      </div>

      {/* Content Area - Flex otimizado para scroll */}
      <div className="flex-1 min-h-0 relative">
        <EnhancedChatContent
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          isNavigating={isNavigating}
          memoryDataMap={memoryDataMap}
          renderMessageExtras={renderMessageExtras}
        />
      </div>

      {/* Input Area - Sempre visível e fixo */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-xl border-t border-border/30">
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

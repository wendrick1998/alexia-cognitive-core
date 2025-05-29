
import { Conversation, Message } from '@/hooks/useConversations';
import ChatHeader from './ChatHeader';
import ChatContent from './ChatContent';
import ChatInputArea from './ChatInputArea';

interface ChatAreaProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  onSendMessage: (message: string) => void;
  onBackToConversations?: () => void;
  isMobile: boolean;
  isNavigating?: boolean;
}

const ChatArea = ({ 
  currentConversation, 
  messages,
  processing,
  onSendMessage,
  onBackToConversations, 
  isMobile,
  isNavigating = false
}: ChatAreaProps) => {
  console.log('🎨 ChatArea renderizado:', {
    conversation: currentConversation?.id,
    messages: messages.length,
    processing,
    isNavigating
  });

  return (
    <div className="h-full flex flex-col bg-transparent animate-premium-fade-in">
      {/* Header Premium */}
      <ChatHeader
        currentConversation={currentConversation}
        onBackToConversations={onBackToConversations}
        isMobile={isMobile}
        isNavigating={isNavigating}
      />

      {/* Messages Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ChatContent
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          isNavigating={isNavigating}
        />
      </div>

      {/* Input Area */}
      <ChatInputArea
        processing={processing}
        onSendMessage={onSendMessage}
        currentConversation={currentConversation}
      />
    </div>
  );
};

export default ChatArea;

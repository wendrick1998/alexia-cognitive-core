
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ConversationsList from './ConversationsList';
import ChatArea from './ChatArea';
import { Conversation } from '@/hooks/useConversations';

interface PremiumChatLayoutProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

const PremiumChatLayout = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation
}: PremiumChatLayoutProps) => {
  const [showConversations, setShowConversations] = useState(true);
  const isMobile = useIsMobile();

  const toggleView = () => {
    setShowConversations(!showConversations);
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-[#0A0A0A] pb-[70px]">
        {showConversations ? (
          <ConversationsList
            conversations={conversations}
            currentConversation={currentConversation}
            onConversationSelect={(conv) => {
              onConversationSelect(conv);
              setShowConversations(false);
            }}
            onNewConversation={onNewConversation}
            isMobile={true}
            onToggleView={toggleView}
          />
        ) : (
          <ChatArea
            currentConversation={currentConversation}
            onBackToConversations={() => setShowConversations(true)}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex bg-[#0A0A0A] relative overflow-hidden">
      {/* Conversations Sidebar - Largura fixa premium */}
      <div className="w-[320px] border-r border-white/10 flex-shrink-0 bg-[#0A0A0A]">
        <ConversationsList
          conversations={conversations}
          currentConversation={currentConversation}
          onConversationSelect={onConversationSelect}
          onNewConversation={onNewConversation}
          isMobile={false}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-w-0 bg-[#0F0F0F]">
        <ChatArea
          currentConversation={currentConversation}
          isMobile={false}
        />
      </div>
    </div>
  );
};

export default PremiumChatLayout;

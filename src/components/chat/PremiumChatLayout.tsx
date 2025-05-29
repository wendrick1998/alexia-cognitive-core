
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
      <div className="h-full flex flex-col bg-black pb-[70px] animate-premium-fade-in">
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
    <div className="h-full flex bg-black relative overflow-hidden animate-premium-fade-in">
      {/* Conversations Sidebar - Premium Glass Design */}
      <div className="w-[320px] flex-shrink-0 relative">
        <div className="absolute inset-0 glass-card border-r border-white/5 backdrop-blur-xl">
          <ConversationsList
            conversations={conversations}
            currentConversation={currentConversation}
            onConversationSelect={onConversationSelect}
            onNewConversation={onNewConversation}
            isMobile={false}
          />
        </div>
      </div>

      {/* Chat Area - Premium Background */}
      <div className="flex-1 min-w-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black">
          <ChatArea
            currentConversation={currentConversation}
            isMobile={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumChatLayout;

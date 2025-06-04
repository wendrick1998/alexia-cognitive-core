
import React from 'react';
import { useChatState } from '@/hooks/useChatState';
import PremiumChatLayout from '@/components/chat/PremiumChatLayout';

const Chat = () => {
  const {
    conversations,
    currentConversation,
    messages,
    processing,
    conversationState,
    handleNewConversation,
    handleConversationSelect,
    handleSendMessage
  } = useChatState();

  return (
    <div className="h-full">
      <PremiumChatLayout
        conversations={conversations}
        currentConversation={currentConversation}
        messages={messages}
        processing={processing}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        onSendMessage={handleSendMessage}
        isCreatingNew={conversationState.isCreating}
        isNavigating={conversationState.isNavigating}
      />
    </div>
  );
};

export default Chat;

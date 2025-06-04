
import { useFocusMode } from '@/hooks/useFocusMode';
import PremiumChatLayout from './chat/PremiumChatLayout';
import FocusMode from './focus/FocusMode';
import ChatKeyboardShortcuts from './chat/ChatKeyboardShortcuts';
import ChatFloatingActions from './chat/ChatFloatingActions';
import ChatMessageExtras from './chat/ChatMessageExtras';
import { useChatState } from '@/hooks/useChatState';

const Chat = () => {
  const { isActive: isFocusModeActive, activateFocusMode, deactivateFocusMode } = useFocusMode();
  
  const {
    conversations,
    currentConversation,
    messages,
    processing,
    conversationState,
    messagesEndRef,
    handleNewConversation,
    handleConversationSelect,
    handleSendMessage
  } = useChatState();

  const renderMessageWithSource = (message: any) => {
    return <ChatMessageExtras message={message} />;
  };

  return (
    <>
      <div className="h-full flex flex-col bg-background overscroll-contain">
        <PremiumChatLayout
          conversations={conversations}
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          onSendMessage={handleSendMessage}
          isCreatingNew={conversationState.isCreatingNew}
          isNavigating={conversationState.isNavigating}
          renderMessageExtras={renderMessageWithSource}
          className="flex-1 overflow-hidden"
        />

        <div ref={messagesEndRef} />

        <ChatFloatingActions
          currentConversation={currentConversation}
          onNewConversation={handleNewConversation}
          onActivateFocusMode={activateFocusMode}
        />
      </div>

      <ChatKeyboardShortcuts
        onNewConversation={handleNewConversation}
        onActivateFocusMode={activateFocusMode}
        onDeactivateFocusMode={deactivateFocusMode}
        isFocusModeActive={isFocusModeActive}
      />

      <FocusMode
        isActive={isFocusModeActive}
        onExit={deactivateFocusMode}
        onSendMessage={handleSendMessage}
        initialText=""
      />
    </>
  );
};

export default Chat;

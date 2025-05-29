
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useConversations } from '@/hooks/useConversations';
import { useFocusMode } from '@/hooks/useFocusMode';
import PremiumChatLayout from './chat/PremiumChatLayout';
import FocusMode from './focus/FocusMode';
import FloatingActionButton from './chat/FloatingActionButton';
import { useIsMobile } from '@/hooks/use-mobile';

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const {
    conversations,
    currentConversation,
    createAndNavigateToNewConversation,
    navigateToConversation,
  } = useConversations();

  const { isActive: isFocusModeActive, activateFocusMode, deactivateFocusMode } = useFocusMode();

  const handleNewConversation = async () => {
    await createAndNavigateToNewConversation();
  };

  const handleConversationSelect = async (conversation: any) => {
    await navigateToConversation(conversation.id);
  };

  const handleFloatingAction = (action: string) => {
    switch (action) {
      case 'new-chat':
        handleNewConversation();
        break;
      case 'focus-mode':
        activateFocusMode();
        toast({
          title: "Focus Mode Ativado",
          description: "Modo de escrita minimalista ativado",
        });
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  };

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleNewConversation();
            break;
          case 'f':
            e.preventDefault();
            activateFocusMode();
            break;
        }
      }
      
      if (e.key === 'Escape' && isFocusModeActive) {
        deactivateFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [isFocusModeActive, deactivateFocusMode, activateFocusMode]);

  return (
    <>
      <div className="h-full relative">
        <PremiumChatLayout
          conversations={conversations}
          currentConversation={currentConversation}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />

        {/* Floating Action Button - Mobile Only */}
        {isMobile && (
          <FloatingActionButton 
            onAction={handleFloatingAction}
            currentSection="chat"
            hasActiveChat={!!currentConversation}
            hasDocument={false}
          />
        )}
      </div>

      {/* Focus Mode Overlay */}
      <FocusMode
        isActive={isFocusModeActive}
        onExit={deactivateFocusMode}
        onSendMessage={() => {}} // Will be handled by the focus mode component
        initialText=""
      />
    </>
  );
};

export default Chat;

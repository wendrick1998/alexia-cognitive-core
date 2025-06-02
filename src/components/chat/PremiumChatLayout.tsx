
import React from 'react';
import { Conversation, Message } from '@/hooks/useConversations';
import { cn } from '@/lib/utils';
import ConversationSidebar from './ConversationSidebar';
import ChatArea from './ChatArea';
import { useIsMobile } from '@/hooks/use-mobile';

interface PremiumChatLayoutProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onSendMessage: (message: string) => void;
  isCreatingNew?: boolean;
  isNavigating?: boolean;
  renderMessageExtras?: (message: Message) => React.ReactNode;
  memoryDataMap?: Map<string, any>;
  className?: string;
}

const PremiumChatLayout: React.FC<PremiumChatLayoutProps> = ({
  conversations,
  currentConversation,
  messages,
  processing,
  onConversationSelect,
  onNewConversation,
  onSendMessage,
  isCreatingNew = false,
  isNavigating = false,
  renderMessageExtras,
  memoryDataMap,
  className
}) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  console.log('🎨 PremiumChatLayout FASE 1 com memória renderizado:', {
    conversations: conversations.length,
    currentConversation: currentConversation?.id,
    messages: messages.length,
    memoryEntries: memoryDataMap?.size || 0,
    processing,
    sidebarOpen
  });

  return (
    <div className={cn("h-full flex bg-gray-50", className)}>
      {/* Sidebar de Conversas */}
      <div className={cn(
        "flex-shrink-0 border-r border-gray-200 bg-white",
        isMobile ? (sidebarOpen ? "w-full" : "w-0") : "w-80",
        isMobile && !sidebarOpen && "hidden"
      )}>
        <ConversationSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onConversationSelect={(conversation) => {
            onConversationSelect(conversation);
            if (isMobile) setSidebarOpen(false);
          }}
          onNewConversation={onNewConversation}
          isCreatingNew={isCreatingNew}
          onClose={isMobile ? () => setSidebarOpen(false) : undefined}
        />
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          onSendMessage={onSendMessage}
          onBackToConversations={isMobile ? () => setSidebarOpen(true) : undefined}
          isMobile={isMobile}
          isNavigating={isNavigating}
          renderMessageExtras={renderMessageExtras}
          memoryDataMap={memoryDataMap}
        />
      </div>
    </div>
  );
};

export default PremiumChatLayout;

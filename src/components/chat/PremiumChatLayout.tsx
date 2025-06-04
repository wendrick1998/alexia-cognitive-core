
import React from 'react';
import { Conversation, Message } from '@/hooks/useConversations';
import { cn } from '@/lib/utils';
import ConversationSidebar from '../ConversationSidebar';
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

  return (
    <div className={cn("h-full flex bg-background overscroll-contain", className)}>
      {/* Premium Sidebar - Integrada sem overlay */}
      {!isMobile && (
        <div className="w-80 flex-shrink-0 border-r border-border/50 bg-background/95 backdrop-blur-xl">
          <ConversationSidebar
            isOpen={true}
            onToggle={() => {}}
          />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-background/95 backdrop-blur-xl border-r border-border shadow-xl">
            <ConversationSidebar
              isOpen={true}
              onToggle={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Área Principal do Chat - Premium Design */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-background via-background to-muted/20">
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

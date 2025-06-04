
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Chat from '@/components/Chat';
import ConversationSidebar from '@/components/ConversationSidebar';
import { Conversation, Message } from '@/hooks/useConversations';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import { cn } from '@/lib/utils';

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
  memoryDataMap?: Map<string, IntegratedMemoryResponse>;
  className?: string;
}

const PremiumChatLayout = ({ 
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
  memoryDataMap = new Map(),
  className
}: PremiumChatLayoutProps) => {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const handleBackToConversations = () => {
    setShowSidebar(true);
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  return (
    <div className={cn("h-full flex bg-background", className)}>
      {/* Desktop Sidebar ou Mobile Overlay */}
      {(showSidebar || !isMobile) && (
        <div className={cn(
          "flex-shrink-0 border-r border-border/30",
          isMobile 
            ? "fixed inset-y-0 left-0 z-50 w-80 bg-background/95 backdrop-blur-xl shadow-xl" 
            : "w-80 relative bg-background/50 backdrop-blur-sm"
        )}>
          <ConversationSidebar
            isOpen={true}
            onToggle={() => setShowSidebar(false)}
          />
        </div>
      )}

      {/* Overlay para mobile */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat Area Principal */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Chat />
      </div>
    </div>
  );
};

export default PremiumChatLayout;

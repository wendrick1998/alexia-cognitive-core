
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import ConversationsList from './ConversationsList';
import ChatArea from './ChatArea';
import { useIsMobile } from '@/hooks/use-mobile';
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
  className?: string;
  sidebarCollapsed?: boolean;
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
  className = "",
  sidebarCollapsed = false
}: PremiumChatLayoutProps) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const isMobile = useIsMobile();

  const handleBackToConversations = () => {
    setShowSidebar(true);
  };

  const handleConversationSelect = (conversation: Conversation) => {
    onConversationSelect(conversation);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  console.log('🎨 PremiumChatLayout renderizado:', {
    conversations: conversations.length,
    currentConversation: currentConversation?.id,
    messages: messages.length,
    showSidebar,
    isMobile,
    sidebarCollapsed
  });

  return (
    <div className={cn("h-full flex bg-transparent", className)}>
      {/* Sidebar Mobile - Overlay */}
      {isMobile && showSidebar && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-80 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversas</h2>
                  </div>
                  <Button
                    onClick={onNewConversation}
                    disabled={isCreatingNew}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isCreatingNew ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                <ConversationsList
                  conversations={conversations}
                  currentConversation={currentConversation}
                  onConversationSelect={handleConversationSelect}
                  onNewConversation={onNewConversation}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar - Quando não colapsada */}
      {!isMobile && !sidebarCollapsed && (
        <div className="w-80 border-r border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversas</h2>
                </div>
                <Button
                  onClick={onNewConversation}
                  disabled={isCreatingNew}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreatingNew ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              <ConversationsList
                conversations={conversations}
                currentConversation={currentConversation}
                onConversationSelect={handleConversationSelect}
                onNewConversation={onNewConversation}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0 h-full">
        <ChatArea
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          onSendMessage={onSendMessage}
          onBackToConversations={isMobile ? handleBackToConversations : undefined}
          isMobile={isMobile}
          isNavigating={isNavigating}
          renderMessageExtras={renderMessageExtras}
        />
      </div>
    </div>
  );
};

export default PremiumChatLayout;

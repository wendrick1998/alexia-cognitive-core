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
  onToggleSidebar?: () => void;
  onRenameConversation?: (conversationId: string, newName: string) => void;
  onTogglePinConversation?: (conversationId: string, isPinned: boolean) => void;
  onDeleteConversation?: (conversationId: string) => void;
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
  sidebarCollapsed = false,
  onToggleSidebar,
  onRenameConversation,
  onTogglePinConversation,
  onDeleteConversation
}: PremiumChatLayoutProps) => {
  const isMobile = useIsMobile();

  const handleConversationSelect = (conversation: Conversation) => {
    console.log('🎯 Conversation selected:', conversation.id);
    onConversationSelect(conversation);
  };

  console.log('🎨 PremiumChatLayout renderizado:', {
    conversations: conversations.length,
    currentConversation: currentConversation?.id,
    messages: messages.length,
    isMobile,
    sidebarCollapsed
  });

  return (
    <div className={cn("h-full flex bg-transparent overflow-hidden", className)}>
      {/* Desktop Sidebar - Only show when not collapsed */}
      {!isMobile && !sidebarCollapsed && (
        <div className="w-80 border-r border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-sidebar">
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
            <div className="flex-1 overflow-y-auto premium-scrollbar">
              <ConversationsList
                conversations={conversations}
                currentConversation={currentConversation}
                onConversationSelect={handleConversationSelect}
                onNewConversation={onNewConversation}
                isMobile={isMobile}
                onRenameConversation={onRenameConversation}
                onTogglePinConversation={onTogglePinConversation}
                onDeleteConversation={onDeleteConversation}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar - Overlay when not collapsed */}
      {isMobile && !sidebarCollapsed && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onToggleSidebar}
          />
          
          {/* Sidebar Panel */}
          <div className="fixed top-0 left-0 w-80 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-sidebar">
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
            <div className="flex-1 overflow-y-auto premium-scrollbar">
              <ConversationsList
                conversations={conversations}
                currentConversation={currentConversation}
                onConversationSelect={handleConversationSelect}
                onNewConversation={onNewConversation}
                isMobile={isMobile}
                onRenameConversation={onRenameConversation}
                onTogglePinConversation={onTogglePinConversation}
                onDeleteConversation={onDeleteConversation}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Chat Area - Full height with proper overflow */}
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <ChatArea
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          onSendMessage={onSendMessage}
          onBackToConversations={isMobile ? onToggleSidebar : undefined}
          isMobile={isMobile}
          isNavigating={isNavigating}
          renderMessageExtras={renderMessageExtras}
        />
      </div>
    </div>
  );
};

export default PremiumChatLayout;

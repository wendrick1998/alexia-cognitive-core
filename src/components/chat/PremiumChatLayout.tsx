
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import ConversationsList from './ConversationsList';
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

  console.log('🎨 PremiumChatLayout com memória integrada:', {
    conversations: conversations.length,
    currentConversation: currentConversation?.id,
    messages: messages.length,
    memoryEntries: memoryDataMap.size,
    showSidebar,
    isMobile
  });

  return (
    <div className={`h-full flex bg-transparent ${className || ''}`}>
      {/* Sidebar - Desktop sempre visível, Mobile condicional */}
      {(!isMobile || showSidebar) && (
        <div className={`${isMobile ? 'absolute inset-0 z-50' : 'w-80 border-r border-white/10'} glass-card`}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Conversas</h2>
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
            <div className="flex-1 overflow-y-auto min-h-0">
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

      {/* Main Chat Area - Com dados de memória */}
      <div className="flex-1 min-h-0 h-full">
        <ChatArea
          currentConversation={currentConversation}
          messages={messages}
          processing={processing}
          onSendMessage={onSendMessage}
          onBackToConversations={isMobile ? handleBackToConversations : undefined}
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

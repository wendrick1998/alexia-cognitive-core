
import React from 'react';
import { Conversation } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onBackToConversations?: () => void;
  isMobile: boolean;
  isNavigating?: boolean;
}

const ChatHeader = ({
  currentConversation,
  onBackToConversations,
  isMobile,
  isNavigating
}: ChatHeaderProps) => {
  return (
    <div className="border-b border-white/10 p-4 bg-black/50 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {isMobile && onBackToConversations && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToConversations}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-white">
            {currentConversation?.name || 'Nova Conversa'}
          </h2>
        </div>
        
        {isNavigating && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;

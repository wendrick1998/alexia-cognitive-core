
import React from 'react';
import { Conversation } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ConversationsListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isMobile: boolean;
}

const ConversationsList = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation,
  isMobile
}: ConversationsListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm mb-4">Nenhuma conversa ainda</p>
        <Button onClick={onNewConversation} size="sm">
          Iniciar Conversa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {conversations.map((conversation) => (
        <Button
          key={conversation.id}
          variant={currentConversation?.id === conversation.id ? "default" : "ghost"}
          className="w-full justify-start text-left h-auto p-3"
          onClick={() => onConversationSelect(conversation)}
        >
          <div className="flex flex-col items-start w-full">
            <span className="font-medium truncate w-full">
              {conversation.name || 'Conversa sem título'}
            </span>
            {conversation.last_message_preview && (
              <span className="text-xs text-gray-500 truncate w-full">
                {conversation.last_message_preview}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ConversationsList;

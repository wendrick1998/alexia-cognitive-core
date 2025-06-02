
import { useState } from 'react';
import { Conversation } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Plus, Search, MessageSquare, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConversationMenu from './ConversationMenu';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isMobile: boolean;
  onRenameConversation?: (conversationId: string, newName: string) => void;
  onTogglePinConversation?: (conversationId: string, isPinned: boolean) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

const ConversationsList = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation,
  isMobile,
  onRenameConversation,
  onTogglePinConversation,
  onDeleteConversation
}: ConversationsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(conv => conv.is_favorite);
  const normalConversations = filteredConversations.filter(conv => !conv.is_favorite);

  const handleRename = (conversationId: string, newName: string) => {
    if (onRenameConversation) {
      onRenameConversation(conversationId, newName);
    }
  };

  const handleTogglePin = (conversationId: string, isPinned: boolean) => {
    if (onTogglePinConversation) {
      onTogglePinConversation(conversationId, isPinned);
    }
  };

  const handleDelete = (conversationId: string) => {
    if (onDeleteConversation) {
      onDeleteConversation(conversationId);
    }
  };

  const renderConversation = (conversation: Conversation) => {
    const isActive = currentConversation?.id === conversation.id;
    const lastUpdate = conversation.updated_at 
      ? formatDistanceToNow(new Date(conversation.updated_at), { 
          addSuffix: true, 
          locale: ptBR 
        })
      : '';

    return (
      <div
        key={conversation.id}
        className={cn(
          "group relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
          isActive && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
        )}
        onClick={() => onConversationSelect(conversation)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1">
              {conversation.is_favorite && (
                <Pin className="h-3 w-3 text-blue-500 fill-current" />
              )}
              <h4 className={cn(
                "font-medium text-sm truncate",
                isActive 
                  ? "text-blue-700 dark:text-blue-300" 
                  : "text-gray-900 dark:text-gray-100"
              )}>
                {conversation.name || 'Nova Conversa'}
              </h4>
            </div>
            
            {conversation.last_message_preview && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                {conversation.last_message_preview}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>{lastUpdate}</span>
              {conversation.message_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {conversation.message_count}
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            <ConversationMenu
              conversation={conversation}
              onRename={handleRename}
              onTogglePin={handleTogglePin}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    );
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Nenhuma conversa ainda
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Comece uma nova conversa para ver o histórico aqui
        </p>
        <Button
          onClick={onNewConversation}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth'
        }}
      >
        <div className="p-2 space-y-1 pb-8">
          {pinnedConversations.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
                Fixadas
              </h5>
              {pinnedConversations.map(renderConversation)}
            </div>
          )}

          {normalConversations.length > 0 && (
            <div>
              {pinnedConversations.length > 0 && (
                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
                  Recentes
                </h5>
              )}
              {normalConversations.map(renderConversation)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsList;

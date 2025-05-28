
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConversationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ConversationSidebar = ({ isOpen, onToggle }: ConversationSidebarProps) => {
  const { user } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    createConversation, 
    setCurrentConversation,
    loadMessages,
    deleteConversation,
    loadConversations
  } = useConversations();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const handleNewConversation = async () => {
    await createConversation();
  };

  const handleSelectConversation = async (conversation: any) => {
    setCurrentConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
      await deleteConversation(conversationId);
    }
  };

  const getConversationTitle = (conversation: any) => {
    // Se a conversa tem mensagens, usar as primeiras palavras da primeira mensagem do usuário
    return `Conversa de ${formatDistanceToNow(new Date(conversation.created_at), { 
      addSuffix: true, 
      locale: ptBR 
    })}`;
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Conversas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </Button>
        </div>
        
        <Button
          onClick={handleNewConversation}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversation?.id === conversation.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getConversationTitle(conversation)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.updated_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa ainda</p>
              <p className="text-xs">Comece uma nova conversa!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;

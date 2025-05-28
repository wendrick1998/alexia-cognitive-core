
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Plus, Trash2, X } from "lucide-react";
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
    return `Conversa de ${formatDistanceToNow(new Date(conversation.created_at), { 
      addSuffix: true, 
      locale: ptBR 
    })}`;
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-slate-200/60 flex flex-col shadow-xl">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Conversas</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <Button
          onClick={handleNewConversation}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      {/* Enhanced Conversations List */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                currentConversation?.id === conversation.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                  : 'hover:bg-slate-50 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  currentConversation?.id === conversation.id 
                    ? 'bg-blue-500' 
                    : 'bg-slate-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    currentConversation?.id === conversation.id 
                      ? 'text-blue-900' 
                      : 'text-slate-800'
                  }`}>
                    {getConversationTitle(conversation)}
                  </p>
                  <p className={`text-xs ${
                    currentConversation?.id === conversation.id 
                      ? 'text-blue-600' 
                      : 'text-slate-500'
                  }`}>
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
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-base font-medium mb-2">Nenhuma conversa ainda</p>
              <p className="text-sm">Comece uma nova conversa para começar!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;

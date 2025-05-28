
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bot, Plus, Sparkles, Loader2 } from "lucide-react";
import { Conversation } from "@/hooks/useConversations";

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewConversation: () => void;
  isCreatingNew?: boolean;
  isNavigating?: boolean;
}

const ChatHeader = ({ 
  currentConversation, 
  sidebarOpen, 
  onToggleSidebar, 
  onNewConversation,
  isCreatingNew = false,
  isNavigating = false
}: ChatHeaderProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-6 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-slate-600 hover:text-slate-800 hover:bg-white/80 rounded-xl shadow-sm border border-slate-200/50"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                {isNavigating ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Bot className="w-6 h-6 text-white" />
                )}
              </div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isNavigating ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'
              }`} />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {isNavigating ? 'Carregando...' : (currentConversation?.name || 'Alex iA')}
                </h1>
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-2 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
                {isCreatingNew && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Criando...
                  </Badge>
                )}
              </div>
              {currentConversation && !isNavigating && (
                <p className="text-sm text-slate-500 flex items-center space-x-2">
                  <span>Conversa iniciada em {new Date(currentConversation.created_at).toLocaleDateString('pt-BR')}</span>
                  {currentConversation.message_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{currentConversation.message_count} mensagens</span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNewConversation}
          disabled={isCreatingNew}
          className="flex items-center space-x-2 rounded-xl border-slate-200 hover:bg-white/80 shadow-sm bg-white/60 backdrop-blur-sm"
        >
          {isCreatingNew ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>{isCreatingNew ? 'Criando...' : 'Nova Conversa'}</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;

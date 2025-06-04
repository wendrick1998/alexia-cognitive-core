
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Menu } from 'lucide-react';
import { Conversation } from '@/hooks/useConversations';
import { useConversations } from '@/hooks/useConversations';
import { useState } from 'react';

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
  isNavigating = false 
}: ChatHeaderProps) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <>
      {/* Header Principal */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          {/* Botão discreto para abrir conversas */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSidebar}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 h-8 w-8 p-0"
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Botão de voltar (mobile) */}
          {isMobile && onBackToConversations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToConversations}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200 h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}

          {/* Informações da conversa */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground text-sm truncate">
                {isNavigating ? 'Carregando...' : currentConversation?.name || 'Nova Conversa'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isNavigating ? 'Aguarde...' : 'IA Premium'}
              </p>
            </div>
          </div>
        </div>

        {/* Área direita (pode adicionar mais ações aqui) */}
        <div className="flex items-center space-x-2">
          {/* Placeholder para futuras ações */}
        </div>
      </div>

      {/* Sidebar de conversas (overlay quando aberta) */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-background/95 backdrop-blur-xl border-r border-border/50 shadow-xl">
            <div className="h-full overflow-hidden">
              {/* Importar e usar o ConversationSidebar aqui */}
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">Conversas</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(false)}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Lista de conversas</p>
                  <p className="text-xs">Em desenvolvimento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;

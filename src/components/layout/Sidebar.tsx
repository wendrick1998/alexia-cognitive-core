
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { 
  LayoutDashboard, 
  MessageCircle, 
  FileText, 
  Settings,
  LogOut,
  Plus,
  Trash2,
  User,
  Brain,
  BarChart3,
  X
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose?: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, onClose }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const { 
    conversations, 
    createAndNavigateToNewConversation, 
    deleteConversation,
    navigateToConversation,
    currentConversation 
  } = useConversations();
  const { toast } = useToast();
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e estatísticas'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageCircle,
      description: 'Conversas com IA'
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: FileText,
      description: 'Gerenciar documentos'
    },
    {
      id: 'cognitive',
      label: 'Cognitive',
      icon: Brain,
      description: 'Sistema cognitivo'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Análises e métricas'
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    onClose?.();
  };

  const handleNewChat = async () => {
    try {
      await createAndNavigateToNewConversation();
      onSectionChange('chat');
      onClose?.();
      toast({
        title: "Nova conversa criada",
        description: "Conversa pronta para uso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova conversa",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      setDeletingConversationId(null);
      toast({
        title: "Conversa excluída",
        description: "A conversa foi removida com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa",
        variant: "destructive",
      });
    }
  };

  const handleConversationClick = async (conversation: any) => {
    try {
      await navigateToConversation(conversation);
      onSectionChange('chat');
      onClose?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir a conversa",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Alexia
          </h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="text-xs text-white/60">
              {user?.email || 'email@exemplo.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Quick Actions */}
        <div className="mb-6">
          <Button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
            aria-label="Criar nova conversa"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <h3 className="text-xs uppercase tracking-wider text-white/40 font-medium px-2 py-1">
            Menu Principal
          </h3>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleSectionClick(item.id)}
                className={`
                  w-full justify-start h-auto p-3 text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
                aria-label={`Ir para ${item.label}`}
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-white/50">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Recent Conversations */}
        {conversations.length > 0 && (
          <div className="space-y-1 mt-6">
            <h3 className="text-xs uppercase tracking-wider text-white/40 font-medium px-2 py-1">
              Conversas Recentes
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {conversations.slice(0, 10).map((conversation) => {
                const isActive = currentConversation?.id === conversation.id;
                
                return (
                  <div key={conversation.id} className="group relative">
                    <Button
                      variant="ghost"
                      onClick={() => handleConversationClick(conversation)}
                      className={`
                        w-full justify-start text-left p-2 text-sm transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-500/20 text-white border border-blue-500/30' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                        }
                      `}
                      aria-label={`Abrir conversa: ${conversation.name || 'Sem título'}`}
                    >
                      <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {conversation.name || 'Nova Conversa'}
                      </span>
                    </Button>
                    
                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-6 h-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          aria-label={`Excluir conversa: ${conversation.name || 'Sem título'}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-white/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Excluir conversa
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            Tem certeza que deseja excluir "{conversation.name || 'Nova Conversa'}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteConversation(conversation.id)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Button
          variant="ghost"
          onClick={() => handleSectionClick('settings')}
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
          aria-label="Abrir configurações"
        >
          <Settings className="w-4 h-4 mr-3" />
          Configurações
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/20"
              aria-label="Fazer logout"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Fazer logout</AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                Tem certeza que deseja sair da sua conta?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Sair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Sidebar;


import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  X,
  BarChart3,
  MessageCircle,
  Brain,
  FileText,
  Search,
  Zap,
  Settings,
  User,
  LogOut,
  Sparkles,
  CreditCard,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SlideOutSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const menuSections = [
  {
    title: "PRINCIPAL",
    items: [
      { id: "dashboard", title: "Dashboard", icon: BarChart3, description: "Visão geral e insights" },
      { id: "chat", title: "Chat", icon: MessageCircle, description: "Conversas com IA" },
      { id: "search", title: "Busca Semântica", icon: Search, description: "Encontre qualquer informação" },
      { id: "memory", title: "Gerenciar Memória", icon: Brain, description: "Gestão de conhecimento" },
      { id: "documents", title: "Documentos Conectados", icon: FileText, description: "PDFs, textos e arquivos" },
      { id: "actions", title: "Meus Projetos", icon: Zap, description: "Ações automáticas" }
    ]
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { id: "preferences", title: "Preferências do Usuário", icon: User, description: "Configurações pessoais" },
      { id: "subscription", title: "Assinatura", icon: CreditCard, description: "Planos e pagamento" },
      { id: "privacy", title: "Configurações de IA", icon: Settings, description: "Configurações do sistema" },
      { id: "security", title: "Privacidade", icon: Lock, description: "Segurança e dados" }
    ]
  }
];

const SlideOutSidebar = ({ isOpen, onClose, currentSection, onSectionChange }: SlideOutSidebarProps) => {
  const { user, signOut } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle swipe to close
  useEffect(() => {
    let startX = 0;
    let currentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      
      if (diff > 50) { // Swipe left to close
        onClose();
      }
    };

    if (isOpen && sidebarRef.current) {
      sidebarRef.current.addEventListener('touchstart', handleTouchStart);
      sidebarRef.current.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      if (sidebarRef.current) {
        sidebarRef.current.removeEventListener('touchstart', handleTouchStart);
        sidebarRef.current.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [isOpen, onClose]);

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 ease-out",
          isOpen 
            ? "bg-black/50 backdrop-blur-sm opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 right-0 h-full w-[85vw] max-w-[400px] z-50",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
          "border-l border-gray-200/50 dark:border-gray-700/50",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Alex iA
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema Cognitivo v2.0</p>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4 h-[calc(100vh-200px)]">
          <div className="space-y-8">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 text-left group",
                          isActive 
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          isActive 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.email?.split('@')[0] || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Premium Account</p>
            </div>
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border-gray-200 dark:border-gray-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default SlideOutSidebar;

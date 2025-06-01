
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  MessageCircle,
  Brain,
  FileText,
  Target,
  BarChart3,
  Network,
  Palette,
  Users,
  Globe,
  Zap,
  Settings,
  User,
  CreditCard,
  Lock,
  LogOut,
  X,
  Sparkles,
  RotateCcw,
  CheckCircle,
  Search,
  Play,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PremiumSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const menuSections = [
  {
    title: "PRINCIPAL",
    items: [
      { id: "chat", title: "Chat", icon: MessageCircle },
      { id: "memory", title: "Memórias", icon: Brain },
      { id: "documents", title: "Documentos", icon: FileText },
      { id: "search", title: "Busca Semântica", icon: Search },
      { id: "actions", title: "Projetos", icon: FolderOpen }
    ]
  },
  {
    title: "INTELIGÊNCIA", 
    items: [
      { id: "deep-thinking", title: "Deep Thinking", icon: Brain },
      { id: "objectives", title: "Objetivos", icon: Target },
      { id: "analytics", title: "Analytics", icon: BarChart3 },
      { id: "connections", title: "Conexões", icon: Network }
    ]
  },
  {
    title: "FERRAMENTAS",
    items: [
      { id: "cognitive-modes", title: "Modos Cognitivos", icon: Palette },
      { id: "collaboration", title: "Colaboração", icon: Users },
      { id: "integrations", title: "Integrações", icon: Globe },
      { id: "api", title: "API & Webhooks", icon: Zap }
    ]
  },
  {
    title: "EXPERIÊNCIA",
    items: [
      { id: "focus-mode", title: "Modo Foco", icon: Target },
      { id: "voice-mode", title: "Modo Voz", icon: Play },
      { id: "quick-actions", title: "Ações Rápidas", icon: Zap }
    ]
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { id: "preferences", title: "Preferências", icon: Settings },
      { id: "profile", title: "Perfil", icon: User },
      { id: "subscription", title: "Assinatura", icon: CreditCard },
      { id: "privacy", title: "Privacidade", icon: Lock }
    ]
  }
];

const PremiumSidebar = ({ isOpen, onClose, currentSection, onSectionChange }: PremiumSidebarProps) => {
  const { user, signOut } = useAuth();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    onClose();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 ease-out ${
          isOpen 
            ? 'bg-black/50 backdrop-blur-sm opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar - Agora abre pela ESQUERDA */}
      <div className={`
        fixed top-0 left-0 h-full w-[320px] z-50 
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div 
          className="h-full backdrop-blur-xl border-r border-white/10"
          style={{
            background: 'rgba(10, 10, 10, 0.95)',
            borderRight: '1px solid',
            borderImage: 'linear-gradient(to bottom, #6366F1, #EC4899) 1'
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Alex iA
                  </h1>
                  <p className="text-xs text-white/60">Sistema Cognitivo v2.0</p>
                </div>
              </div>
              
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-white/10 text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Menu Content - Agora SCROLLABLE */}
          <ScrollArea className="flex-1 px-6 py-4 h-[calc(100vh-200px)]" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}>
            <div className="space-y-6">
              {menuSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
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
                          className={`
                            w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                            transition-all duration-200 text-left group relative overflow-hidden
                            ${isActive 
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border-l-2 border-blue-400' 
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                            }
                          `}
                        >
                          {/* Hover gradient border */}
                          {!isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-0 bg-gradient-to-b from-blue-400 to-purple-400 transition-all duration-200 group-hover:w-0.5" />
                          )}
                          
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium">{item.title}</span>
                          
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute right-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 space-y-4 bg-black/20">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <Avatar className="w-10 h-10 border border-white/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-white/60">Premium Account</p>
              </div>
            </div>

            {/* Sync Status & Logout */}
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center space-x-2">
                {syncStatus === 'synced' && <CheckCircle className="w-3 h-3 text-green-400" />}
                {syncStatus === 'syncing' && <RotateCcw className="w-3 h-3 animate-spin text-blue-400" />}
                <span>
                  {syncStatus === 'synced' && 'Sincronizado'}
                  {syncStatus === 'syncing' && 'Sincronizando...'}
                  {syncStatus === 'offline' && 'Offline'}
                </span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="p-1 h-auto text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumSidebar;

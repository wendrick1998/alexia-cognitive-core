
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3,
  MessageCircle, 
  Search, 
  FileText, 
  Brain,
  Zap,
  User,
  Settings,
  Shield,
  CreditCard,
  FileCode,
  Plug,
  LogOut,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose?: () => void;
}

const Sidebar = ({ activeSection, onSectionChange, onClose }: SidebarProps) => {
  const { user, signOut } = useAuth();

  const navigationSections = [
    {
      title: "PRINCIPAL",
      items: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Visão geral do sistema" },
        { id: "chat", label: "Chat", icon: MessageCircle, description: "Conversas com IA" },
        { id: "search", label: "Busca Semântica", icon: Search, description: "Encontre informações", badge: "Premium" },
        { id: "memory", label: "Memória", icon: Brain, description: "Gestão de conhecimento" },
        { id: "documents", label: "Documentos", icon: FileText, description: "PDFs e arquivos" },
        { id: "projects", label: "Projetos", icon: Zap, description: "Ações automáticas", badge: "Beta" }
      ]
    },
    {
      title: "CONFIGURAÇÕES",
      items: [
        { id: "preferences", label: "Preferências", icon: User, description: "Configurações pessoais" },
        { id: "ai-config", label: "Configurações de IA", icon: Settings, description: "Parâmetros do sistema" },
        { id: "integrations", label: "Integrações", icon: Plug, description: "APIs e serviços" },
        { id: "security", label: "Segurança", icon: Shield, description: "Proteção e acesso" }
      ]
    },
    {
      title: "ADMINISTRAÇÃO",
      items: [
        { id: "subscription", label: "Assinatura", icon: CreditCard, description: "Planos e cobrança" },
        { id: "logs", label: "Logs do Sistema", icon: FileCode, description: "Monitoramento" }
      ]
    }
  ];

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    if (onClose) onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    if (onClose) onClose();
  };

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AlexIA</h1>
            <p className="text-sm text-white/60">Sistema Cognitivo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3 rounded-xl transition-all duration-200",
                      "hover:bg-white/5 hover:translate-x-1",
                      isActive && "bg-white/10 text-white border border-white/20"
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-blue-500 text-white" 
                          : "bg-white/5 text-white/60"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">
              {user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="text-xs text-white/60">Premium Account</p>
          </div>
        </div>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-white/60 hover:text-white hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

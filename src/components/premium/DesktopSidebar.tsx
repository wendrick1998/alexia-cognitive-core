
import { useState } from 'react';
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
  Sparkles,
  Cpu,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface DesktopSidebarProps {
  currentSection: string;
  onSectionChange: (section: string, id?: string) => void;
}

const DesktopSidebar = ({ currentSection, onSectionChange }: DesktopSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navigationSections = [
    {
      title: "PRINCIPAL",
      items: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Visão geral do sistema" },
        { id: "chat", label: "Chat com Alex IA", icon: MessageCircle, description: "Assistente Premium" },
        { id: "search", label: "Busca Semântica", icon: Search, description: "Encontre informações", badge: "Premium" },
        { id: "memory", label: "Memória", icon: Brain, description: "Gestão de conhecimento" },
        { id: "documents", label: "Documentos", icon: FileText, description: "PDFs e arquivos" },
        { id: "projects", label: "Projetos", icon: Zap, description: "Ações automáticas", badge: "Beta" }
      ]
    },
    {
      title: "CÓRTEX COGNITIVO",
      items: [
        { id: "cognitive-graph", label: "Grafo Cognitivo", icon: Brain, description: "Visualizar nós cognitivos" },
        { id: "insights", label: "Insights", icon: Sparkles, description: "Insights automáticos" },
        { id: "cortex-dashboard", label: "Córtex Dashboard", icon: Cpu, description: "Auditoria completa", route: "/cortex-dashboard" },
        { id: "validation", label: "Validação de Memórias", icon: CheckCircle, description: "Prevenção de alucinações", route: "/validation", badge: "Novo" }
      ]
    },
    {
      title: "INTEGRAÇÕES",
      items: [
        { id: "integrations-status", label: "Status LLMs", icon: Shield, description: "Monitoramento APIs" },
        { id: "integrations-manager", label: "Gerenciar LLMs", icon: Plug, description: "Adicionar integrações", route: "/integrations-manager" }
      ]
    },
    {
      title: "CONFIGURAÇÕES",
      items: [
        { id: "preferences", label: "Preferências", icon: User, description: "Configurações pessoais" },
        { id: "ai-config", label: "Configurações de IA", icon: Settings, description: "Parâmetros do sistema", route: "/settings" },
        { id: "security", label: "Segurança", icon: Shield, description: "Proteção e acesso", route: "/security" }
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

  const handleItemClick = (item: any) => {
    if (item.route) {
      navigate(item.route);
    } else {
      onSectionChange(item.id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-full bg-gradient-to-b from-black to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Alex IA</h1>
            <p className="text-sm text-white/60">Sistema Cognitivo Premium</p>
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
                const isActive = currentSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3 rounded-xl transition-all duration-200",
                      "hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 hover:translate-x-1",
                      isActive && "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg"
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isActive 
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg" 
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
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/5 to-white/10 rounded-xl mb-3 border border-white/10">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
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
          className="w-full justify-start text-white/60 hover:text-white hover:bg-red-500/10 hover:border-red-500/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default DesktopSidebar;


import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageCircle, 
  Search, 
  FileText, 
  Brain,
  FolderOpen,
  Settings,
  User,
  Shield,
  CreditCard,
  Network,
  Lightbulb,
  Activity,
  Zap,
  Globe,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideOutSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  // Core Features
  { id: 'dashboard', icon: Home, label: 'Dashboard', group: 'Principal' },
  { id: 'chat', icon: MessageCircle, label: 'Chat', group: 'Principal' },
  { id: 'search', icon: Search, label: 'Buscar', group: 'Principal' },
  { id: 'memory', icon: Brain, label: 'Memórias', group: 'Principal' },
  { id: 'documents', icon: FileText, label: 'Documentos', group: 'Principal' },
  { id: 'actions', icon: FolderOpen, label: 'Projetos', group: 'Principal' },
  
  // Cognitive Intelligence
  { id: 'cognitive-graph', icon: Network, label: 'Rede Cognitiva', group: 'Inteligência' },
  { id: 'insights', icon: Lightbulb, label: 'Insights', group: 'Inteligência' },
  { id: 'cortex-dashboard', icon: Activity, label: 'Córtex Dashboard', group: 'Inteligência' },
  
  // Integrations
  { id: 'integrations-status', icon: Zap, label: 'Status Integrações', group: 'Integrações' },
  { id: 'integrations-manager', icon: Globe, label: 'Gerenciar APIs', group: 'Integrações' },
  
  // Settings
  { id: 'preferences', icon: Settings, label: 'Preferências', group: 'Configurações' },
  { id: 'privacy', icon: Shield, label: 'Privacidade', group: 'Configurações' },
  { id: 'subscription', icon: CreditCard, label: 'Assinatura', group: 'Configurações' },
];

const SlideOutSidebar = ({ isOpen, onClose, currentSection, onSectionChange }: SlideOutSidebarProps) => {
  const handleItemClick = (sectionId: string) => {
    onSectionChange(sectionId);
    onClose();
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="font-bold text-gray-900 dark:text-gray-100">Alex IA</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistema Cognitivo</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {groupName}
                  </h3>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isActive = currentSection === item.id;
                      const Icon = item.icon;

                      return (
                        <Button
                          key={item.id}
                          variant="ghost"
                          onClick={() => handleItemClick(item.id)}
                          className={cn(
                            "w-full justify-start px-3 py-2 h-auto transition-all duration-200",
                            isActive 
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500" 
                              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                          )}
                        >
                          <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 h-auto text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <User className="w-5 h-5 mr-3" />
              <span className="font-medium">Perfil do Usuário</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideOutSidebar;

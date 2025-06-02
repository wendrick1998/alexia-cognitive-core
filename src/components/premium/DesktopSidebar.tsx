
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  // Core Features
  { id: 'dashboard', icon: Home, label: 'Dashboard', group: 'core' },
  { id: 'chat', icon: MessageCircle, label: 'Chat', group: 'core' },
  { id: 'search', icon: Search, label: 'Buscar', group: 'core' },
  { id: 'memory', icon: Brain, label: 'Memórias', group: 'core' },
  { id: 'documents', icon: FileText, label: 'Documentos', group: 'core' },
  { id: 'actions', icon: FolderOpen, label: 'Projetos', group: 'core' },
  
  // Cognitive Intelligence
  { id: 'cognitive-graph', icon: Network, label: 'Rede Cognitiva', group: 'cognitive' },
  { id: 'insights', icon: Lightbulb, label: 'Insights', group: 'cognitive' },
  { id: 'cortex-dashboard', icon: Activity, label: 'Córtex Dashboard', group: 'cognitive' },
  
  // Integrations
  { id: 'integrations-status', icon: Zap, label: 'Status Integrações', group: 'integrations' },
  { id: 'integrations-manager', icon: Globe, label: 'Gerenciar APIs', group: 'integrations' },
  
  // Settings
  { id: 'preferences', icon: Settings, label: 'Preferências', group: 'settings' },
  { id: 'privacy', icon: Shield, label: 'Privacidade', group: 'settings' },
  { id: 'subscription', icon: CreditCard, label: 'Assinatura', group: 'settings' },
];

const DesktopSidebar = ({ currentSection, onSectionChange }: DesktopSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleItemClick = (sectionId: string) => {
    onSectionChange(sectionId);
  };

  const renderNavigationGroup = (groupItems: typeof navigationItems, groupLabel?: string) => (
    <div className="space-y-1">
      {groupLabel && isExpanded && (
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {groupLabel}
          </p>
        </div>
      )}
      {groupItems.map((item) => {
        const isActive = currentSection === item.id;
        const Icon = item.icon;

        const buttonContent = (
          <Button
            variant="ghost"
            size={isExpanded ? "default" : "icon"}
            onClick={() => handleItemClick(item.id)}
            className={cn(
              "w-full transition-all duration-200",
              isExpanded ? "justify-start px-3" : "justify-center px-0",
              isActive 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            )}
          >
            <Icon className={cn("flex-shrink-0", isExpanded ? "w-4 h-4 mr-3" : "w-5 h-5")} />
            {isExpanded && <span className="font-medium">{item.label}</span>}
          </Button>
        );

        if (!isExpanded) {
          return (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {buttonContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return <div key={item.id}>{buttonContent}</div>;
      })}
    </div>
  );

  const coreItems = navigationItems.filter(item => item.group === 'core');
  const cognitiveItems = navigationItems.filter(item => item.group === 'cognitive');
  const integrationItems = navigationItems.filter(item => item.group === 'integrations');
  const settingsItems = navigationItems.filter(item => item.group === 'settings');

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 z-40 flex flex-col",
        isExpanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className={cn("p-4 border-b border-gray-200/50 dark:border-gray-700/50", isExpanded ? "px-6" : "px-4")}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          {isExpanded && (
            <div className="ml-3">
              <h1 className="font-bold text-gray-900 dark:text-gray-100">Alex IA</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema Cognitivo</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        {renderNavigationGroup(coreItems, isExpanded ? "Principal" : undefined)}
        
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
          {renderNavigationGroup(cognitiveItems, isExpanded ? "Inteligência" : undefined)}
        </div>
        
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
          {renderNavigationGroup(integrationItems, isExpanded ? "Integrações" : undefined)}
        </div>
        
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
          {renderNavigationGroup(settingsItems, isExpanded ? "Configurações" : undefined)}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <Button
          variant="ghost"
          size={isExpanded ? "default" : "icon"}
          className={cn(
            "w-full transition-all duration-200",
            isExpanded ? "justify-start px-3" : "justify-center px-0",
            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          )}
        >
          <User className={cn("flex-shrink-0", isExpanded ? "w-4 h-4 mr-3" : "w-5 h-5")} />
          {isExpanded && <span className="font-medium">Perfil</span>}
        </Button>
      </div>
    </div>
  );
};

export default DesktopSidebar;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  MessageCircle, 
  Brain, 
  FileText, 
  Search,
  Zap,
  ChevronRight,
  Settings,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    shortcut: "⌘D"
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageCircle,
    shortcut: "⌘N"
  },
  {
    id: "search",
    label: "Busca Semântica",
    icon: Search,
    shortcut: "⌘K"
  },
  {
    id: "memory",
    label: "Gerenciar Memória",
    icon: Brain,
  },
  {
    id: "documents",
    label: "Documentos Conectados",
    icon: FileText,
  },
  {
    id: "actions",
    label: "Meus Projetos",
    icon: Zap,
  },
  {
    id: "preferences",
    label: "Preferências do Usuário",
    icon: User,
  },
  {
    id: "privacy",
    label: "Configurações de IA",
    icon: Settings,
  },
];

const DesktopSidebar = ({ currentSection, onSectionChange }: DesktopSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ease-out z-40",
        isExpanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          {isExpanded && (
            <div className="ml-3 opacity-0 animate-fade-in">
              <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100">AlexIA</h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <Button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                variant="ghost"
                className={cn(
                  "w-full justify-start transition-all duration-200 hover:scale-105 group relative",
                  isExpanded ? "px-4 py-3" : "px-3 py-3",
                  isActive && "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                )}
              >
                {/* Icon */}
                <Icon className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                )} />
                
                {/* Label */}
                {isExpanded && (
                  <span className="ml-3 font-medium opacity-0 animate-fade-in">
                    {item.label}
                  </span>
                )}

                {/* Shortcut */}
                {isExpanded && item.shortcut && (
                  <kbd className="ml-auto px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs opacity-60">
                    {item.shortcut}
                  </kbd>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r" />
                )}

                {/* Hover tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {item.shortcut && (
                      <span className="ml-2 opacity-60">{item.shortcut}</span>
                    )}
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Expand indicator */}
      {!isExpanded && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-30">
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default DesktopSidebar;

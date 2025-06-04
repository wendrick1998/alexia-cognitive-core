
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  Search, 
  Brain, 
  FileText, 
  Menu,
  User,
  Settings
} from 'lucide-react';

interface BottomNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle: () => void;
}

const BottomNavigation = ({ currentSection, onSectionChange, onMenuToggle }: BottomNavigationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainNavItems = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'search', icon: Search, label: 'Busca' },
    { id: 'memory', icon: Brain, label: 'Memória' },
    { id: 'documents', icon: FileText, label: 'Docs' },
  ];

  const secondaryNavItems = [
    { id: 'profile', icon: User, label: 'Perfil' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  return (
    <>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="safe-area-padding-bottom">
          {/* Expanded Menu */}
          {isExpanded && (
            <div className="px-4 py-3 border-b border-border">
              <div className="grid grid-cols-2 gap-2">
                {secondaryNavItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsExpanded(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 justify-start h-10",
                      currentSection === item.id && "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="flex items-center justify-around px-2 py-2">
            {mainNavItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0",
                  currentSection === item.id && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs truncate">{item.label}</span>
              </Button>
            ))}

            {/* Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                isExpanded && "bg-accent text-accent-foreground"
              )}
            >
              <Menu className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-90")} />
              <span className="text-xs">Menu</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;

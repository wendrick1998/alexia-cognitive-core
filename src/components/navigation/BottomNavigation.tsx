
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  MessageCircle, 
  Brain, 
  Menu, 
  CheckCircle,
  Search,
  Settings,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle: () => void;
}

const BottomNavigation = ({ 
  currentSection, 
  onSectionChange, 
  onMenuToggle 
}: BottomNavigationProps) => {
  const navigate = useNavigate();

  const mainNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      action: () => onSectionChange("dashboard")
    },
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
      action: () => onSectionChange("chat")
    },
    {
      id: "search",
      label: "Busca",
      icon: Search,
      action: () => onSectionChange("search")
    },
    {
      id: "llm-config",
      label: "Config IA",
      icon: Bot,
      action: () => navigate("/llm-config")
    },
    {
      id: "menu",
      label: "Menu",
      icon: Menu,
      action: onMenuToggle
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={item.action}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-14 px-3 rounded-xl transition-all duration-200 relative touch-manipulation",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;

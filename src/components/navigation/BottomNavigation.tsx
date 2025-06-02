
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  MessageCircle, 
  Brain, 
  Menu, 
  CheckCircle,
  Search
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
      id: "validation",
      label: "Validação",
      icon: CheckCircle,
      badge: "Novo",
      action: () => navigate("/validation")
    },
    {
      id: "menu",
      label: "Menu",
      icon: Menu,
      action: onMenuToggle
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
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
                "flex flex-col items-center gap-1 h-14 px-3 rounded-xl transition-all duration-200 relative",
                isActive 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs h-4 px-1 bg-blue-500 text-white border-none"
                  >
                    {item.badge}
                  </Badge>
                )}
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

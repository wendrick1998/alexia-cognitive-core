
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Brain, 
  FileText, 
  Search,
  Zap,
  Menu
} from "lucide-react";

interface PremiumNavigationBarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle: () => void;
  className?: string;
}

const navigationItems = [
  {
    id: "chat",
    label: "Chat",
    icon: MessageCircle,
  },
  {
    id: "memory",
    label: "Memória",
    icon: Brain,
  },
  {
    id: "documents",
    label: "Docs",
    icon: FileText,
  },
  {
    id: "search",
    label: "Buscar",
    icon: Search,
  },
  {
    id: "actions",
    label: "Ações",
    icon: Zap,
  },
];

const PremiumNavigationBar = ({ 
  currentSection, 
  onSectionChange, 
  onMenuToggle,
  className = "" 
}: PremiumNavigationBarProps) => {
  const handleItemClick = (itemId: string) => {
    // Haptic feedback para mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    onSectionChange(itemId);
  };

  const handleMenuClick = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onMenuToggle();
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50",
      className
    )}>
      {/* Safe area for mobile devices */}
      <div className="px-4 pt-3 pb-safe">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Navigation Items */}
          <div className="flex items-center space-x-1 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-1 transition-all duration-300 ease-out rounded-xl px-3 py-2 group relative min-w-0 flex-1",
                    isActive && "transform scale-105"
                  )}
                >
                  {/* Glow effect for active item */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-600/20 blur-sm" />
                  )}
                  
                  {/* Icon */}
                  <div className="relative">
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-300 ease-out",
                        isActive 
                          ? "text-blue-600 dark:text-blue-400 drop-shadow-sm" 
                          : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      )} 
                    />
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "text-xs font-medium transition-all duration-300 ease-out",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Menu Button (Canto direito conforme solicitado) */}
          <div className="ml-3">
            <Button
              onClick={handleMenuClick}
              variant="ghost"
              size="sm"
              className={cn(
                "w-12 h-12 rounded-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 shadow-lg"
              )}
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PremiumNavigationBar;

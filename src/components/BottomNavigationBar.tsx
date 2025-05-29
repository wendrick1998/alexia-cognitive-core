
import { cn } from "@/lib/utils";
import { 
  MessageCircle, 
  Brain, 
  FileText, 
  Search,
  Zap
} from "lucide-react";

interface BottomNavigationBarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
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

const BottomNavigationBar = ({ currentSection, onSectionChange }: BottomNavigationBarProps) => {
  const handleItemClick = (itemId: string) => {
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onSectionChange(itemId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Mobile Navigation (default) */}
      <div className="md:hidden h-20 bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 pb-safe">
        <div className="flex items-center justify-around h-full">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-all duration-300 ease-out",
                  "relative group min-w-0 flex-1 py-2",
                  isActive && "transform scale-105"
                )}
              >
                {/* Glow effect for active item */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] opacity-20 blur-lg" />
                )}
                
                {/* Icon */}
                <div className={cn(
                  "relative transition-all duration-300 ease-out",
                  isActive ? "transform scale-110" : "group-hover:scale-105"
                )}>
                  <Icon 
                    className={cn(
                      "w-7 h-7 transition-all duration-300 ease-out",
                      isActive 
                        ? "text-white drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" 
                        : "text-white/60 group-hover:text-white/80"
                    )} 
                  />
                  
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full blur-md opacity-60 animate-pulse" />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium transition-all duration-300 ease-out",
                  isActive 
                    ? "text-white opacity-100" 
                    : "text-white/60 group-hover:text-white/80"
                )}>
                  {item.label}
                </span>
                
                {/* Liquid animation background */}
                <div className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-500 ease-out",
                  isActive 
                    ? "bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 scale-100" 
                    : "bg-transparent scale-95"
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block h-16 bg-black/60 backdrop-blur-xl border-t border-white/10 px-8">
        <div className="flex items-center justify-center space-x-8 h-full max-w-2xl mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 ease-out",
                  "relative group hover:scale-105",
                  isActive && "transform scale-105"
                )}
              >
                {/* Glow effect for active item */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] opacity-30 blur-lg" />
                )}
                
                {/* Content */}
                <div className="relative flex items-center space-x-3">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-300 ease-out",
                      isActive 
                        ? "text-white drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" 
                        : "text-white/60 group-hover:text-white/80"
                    )} 
                  />
                  
                  <span className={cn(
                    "text-sm font-medium transition-all duration-300 ease-out",
                    isActive 
                      ? "text-white opacity-100" 
                      : "text-white/60 group-hover:text-white/80"
                  )}>
                    {item.label}
                  </span>
                </div>
                
                {/* Background */}
                <div className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-500 ease-out",
                  isActive 
                    ? "bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20" 
                    : "bg-transparent group-hover:bg-white/5"
                )} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigationBar;

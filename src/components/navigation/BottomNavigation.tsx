
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageCircle, 
  Search, 
  FileText, 
  Brain,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BottomNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle: () => void;
}

const navigationItems = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'search', icon: Search, label: 'Buscar' },
  { id: 'documents', icon: FileText, label: 'Docs' },
  { id: 'memory', icon: Brain, label: 'Memória' }
];

const BottomNavigation = ({ currentSection, onSectionChange, onMenuToggle }: BottomNavigationProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-2 py-2">
        <div className="flex items-center justify-between">
          {/* Navigation Items */}
          <div className="flex items-center justify-around flex-1 space-x-1">
            {navigationItems.map((item) => {
              const isActive = currentSection === item.id;
              const Icon = item.icon;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 h-14 px-3 rounded-xl transition-all duration-200",
                    "touch-manipulation select-none min-w-[60px]",
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 scale-105" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Icon className={cn("transition-all duration-200", isActive ? "w-6 h-6" : "w-5 h-5")} />
                  <span className={cn("font-medium leading-none transition-all duration-200", isActive ? "text-xs" : "text-xs")}>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="flex flex-col items-center gap-1 h-14 px-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 min-w-[60px]"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-medium">Menu</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;

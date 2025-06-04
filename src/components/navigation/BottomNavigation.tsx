
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  MessageCircle, 
  Search, 
  Bot,
  Menu
} from 'lucide-react';

interface BottomNavigationProps {
  onMenuToggle: () => void;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

const navigationItems = [
  { id: 'dashboard', icon: Home, path: '/', labelKey: 'navigation.home' },
  { id: 'chat', icon: MessageCircle, path: '/chat', labelKey: 'chat' },
  { id: 'search', icon: Search, path: '/search', labelKey: 'navigation.buscar' },
  { id: 'llm-config', icon: Bot, path: '/llm-config', labelKey: 'llm_config' }
];

const BottomNavigation = ({ onMenuToggle, currentSection, onSectionChange }: BottomNavigationProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Only render on mobile
  if (!isMobile) return null;

  const handleNavigation = (itemId: string) => {
    // Only call onSectionChange if provided and different from current
    if (onSectionChange && currentSection !== itemId) {
      onSectionChange(itemId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-lg">
      {/* Safe area padding for mobile devices */}
      <div 
        className="flex items-center justify-around px-2 py-2"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          minHeight: '80px'
        }}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative",
                "touch-manipulation hover:scale-105 active:scale-95 min-w-[60px] min-h-[60px] justify-center",
                isActive 
                  ? "bg-primary/15 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive ? "drop-shadow-sm" : ""
                )} />
                {isActive && (
                  <div className="absolute -inset-1 bg-primary/20 rounded-full animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium transition-all duration-200 leading-tight text-center",
                isActive ? "font-semibold" : ""
              )}>
                {t(item.labelKey) || item.labelKey.split('.').pop()}
              </span>
            </NavLink>
          );
        })}

        {/* Menu Toggle Button */}
        <Button
          onClick={onMenuToggle}
          variant="ghost"
          size="sm"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
            "touch-manipulation hover:scale-105 active:scale-95 min-w-[60px] min-h-[60px] justify-center",
            "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <div className="relative">
            <Menu className="w-5 h-5 transition-all duration-200" />
          </div>
          <span className="text-xs font-medium transition-all duration-200 leading-tight text-center">
            {t('navigation.menu')}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;

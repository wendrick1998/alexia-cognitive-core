
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bottomNavigationConfig } from '@/config/navConfig';
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  onMenuToggle: () => void;
  currentSection?: string;
  onSectionChange?: (section: string, id?: string) => void;
}

const BottomNavigation = ({ onMenuToggle, currentSection, onSectionChange }: BottomNavigationProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavigationConfig.map((item) => {
          const Icon = item.icon;
          
          // Handle special menu action
          if (item.action === 'toggle-menu') {
            return (
              <Button
                key={item.id}
                onClick={() => onMenuToggle()}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-14 px-3 rounded-xl transition-all duration-200 relative touch-manipulation hover:scale-105 active:scale-95",
                  "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 transition-all duration-200" />
                </div>
                <span className="text-xs font-medium transition-all duration-200">
                  {t('navigation.menu')}
                </span>
              </Button>
            );
          }
          
          // Handle navigation items
          const path = typeof item.action === 'function' ? item.action() : '/';
          const fullPath = path.startsWith('/') ? path : `/${path}`;

          // Use onSectionChange if provided
          const handleClick = () => {
            if (onSectionChange && item.id) {
              onSectionChange(item.id);
            }
          };
          
          const isActive = currentSection === item.id;
          
          return (
            <NavLink
              key={item.id}
              to={fullPath}
              onClick={handleClick}
              className={cn(
                "flex flex-col items-center gap-1 h-14 px-3 rounded-xl transition-all duration-200 relative touch-manipulation hover:scale-105 active:scale-95",
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
                "text-xs font-medium transition-all duration-200",
                isActive ? "font-semibold" : ""
              )}>
                {t(`navigation.${item.id}`) || item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;


import { useState } from 'react';
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
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle: () => void;
}

const navigationItems = [
  { id: 'dashboard', icon: Home, labelKey: 'navigation.home' },
  { id: 'chat', icon: MessageCircle, labelKey: 'chat' },
  { id: 'search', icon: Search, labelKey: 'navigation.buscar' },
  { id: 'documents', icon: FileText, labelKey: 'navigation.docs' },
  { id: 'memory', icon: Brain, labelKey: 'navigation.memoria' }
];

const BottomNavigation = ({ currentSection, onSectionChange, onMenuToggle }: BottomNavigationProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="safe-area-inset-bottom">
        <div className="flex items-center justify-between px-4 py-2">
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
                    "flex flex-col items-center gap-1 h-12 px-2 rounded-xl transition-all duration-200",
                    "touch-manipulation select-none min-w-[50px]",
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium leading-none">{t(item.labelKey)}</span>
                </Button>
              );
            })}
          </div>

          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="flex flex-col items-center gap-1 h-12 px-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-medium">{t('navigation.menu')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;

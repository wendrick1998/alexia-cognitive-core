
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Home, MessageCircle, Search, FileText, Brain, Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface PremiumNavigationBarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle?: () => void;
}

const PremiumNavigationBar = ({ 
  currentSection, 
  onSectionChange, 
  onMenuToggle = () => {} 
}: PremiumNavigationBarProps) => {
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { hapticFeedback, createGestureDetector, deviceInfo } = useMobileOptimization();

  // Add gesture support
  useEffect(() => {
    if (!navRef.current) return;
    
    const cleanup = createGestureDetector(navRef.current);
    
    const handleSwipe = (e: any) => {
      const { direction } = e.detail;
      hapticFeedback('light');
      
      if (direction === 'up') {
        // Pull up gesture for command palette
        onSectionChange('search');
      }
    };

    const handleLongPress = (e: any) => {
      hapticFeedback('medium');
      // Could show context menu or quick actions
    };

    navRef.current.addEventListener('swipe', handleSwipe);
    navRef.current.addEventListener('longpress', handleLongPress);

    return () => {
      cleanup();
      if (navRef.current) {
        navRef.current.removeEventListener('swipe', handleSwipe);
        navRef.current.removeEventListener('longpress', handleLongPress);
      }
    };
  }, [createGestureDetector, hapticFeedback, onSectionChange]);

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'documents', icon: FileText, label: 'Docs' },
    { id: 'memory', icon: Brain, label: 'Memória' }
  ];

  const handleItemPress = (sectionId: string) => {
    setPressedItem(sectionId);
    hapticFeedback('selection');
    
    setTimeout(() => {
      setPressedItem(null);
      onSectionChange(sectionId);
    }, 100);
  };

  const handleItemLongPress = (sectionId: string) => {
    hapticFeedback('medium');
    // Could show quick actions for each section
    console.log(`Long press on ${sectionId}`);
  };

  return (
    <div 
      ref={navRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-black/95 backdrop-blur-xl border-t border-white/10",
        // Safe area support
        "pb-safe",
        deviceInfo.os === 'iOS' && "pb-[max(1rem,env(safe-area-inset-bottom))]"
      )}
      style={{
        paddingBottom: deviceInfo.os === 'iOS' 
          ? 'max(1rem, env(safe-area-inset-bottom))' 
          : '1rem'
      }}
    >
      {/* Gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
      
      <div className="relative px-4 pt-2">
        {/* Pull indicator for swipe gestures */}
        <div className="flex justify-center mb-1">
          <div className="w-8 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const isActive = currentSection === item.id;
            const isPressed = pressedItem === item.id;
            const Icon = item.icon;

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onTouchStart={() => setPressedItem(item.id)}
                onTouchEnd={() => {
                  setPressedItem(null);
                  handleItemPress(item.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleItemLongPress(item.id);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200",
                  "touch-manipulation select-none",
                  "min-h-[60px] min-w-[60px]",
                  isActive && "bg-white/10 text-white",
                  !isActive && "text-white/60 hover:text-white hover:bg-white/5",
                  isPressed && "scale-95 bg-white/20"
                )}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none'
                }}
              >
                <div className={cn(
                  "relative p-2 rounded-xl transition-all duration-200",
                  isActive && "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg",
                  isPressed && "scale-110"
                )}>
                  <Icon className="w-5 h-5" />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -inset-1 bg-white/20 rounded-xl blur-sm -z-10" />
                  )}
                </div>
                
                <span className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  isActive ? "text-white" : "text-white/60"
                )}>
                  {item.label}
                </span>

                {/* Badge for notifications */}
                {item.id === 'chat' && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>
            );
          })}

          {/* Plus button for quick actions */}
          <Button
            variant="ghost"
            size="sm"
            onTouchStart={() => setPressedItem('plus')}
            onTouchEnd={() => {
              setPressedItem(null);
              hapticFeedback('medium');
              // Could open quick actions menu
            }}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200",
              "touch-manipulation select-none",
              "min-h-[60px] min-w-[60px]",
              "text-white/60 hover:text-white hover:bg-white/5",
              pressedItem === 'plus' && "scale-95 bg-white/20"
            )}
            style={{
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <div className={cn(
              "relative p-2 rounded-xl transition-all duration-200 bg-gradient-to-br from-orange-500 to-pink-600",
              pressedItem === 'plus' && "scale-110"
            )}>
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-white/60">Novo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumNavigationBar;

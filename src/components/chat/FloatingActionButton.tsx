
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Focus, Sidebar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsAuthRoute } from '@/hooks/useIsAuthRoute';

interface FloatingActionButtonProps {
  onAction: (action: string) => void;
  currentSection: string;
  hasActiveChat: boolean;
  hasDocument: boolean;
  className?: string;
}

const FloatingActionButton = ({ 
  onAction, 
  currentSection, 
  hasActiveChat, 
  hasDocument,
  className = ""
}: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAuthRoute = useIsAuthRoute();

  // Hide button on auth routes
  if (isAuthRoute) {
    return null;
  }

  const actions = [
    {
      id: 'new-chat',
      icon: MessageSquare,
      label: 'Nova Conversa',
      color: 'bg-blue-600 hover:bg-blue-700',
      show: currentSection === 'chat'
    },
    {
      id: 'focus-mode',
      icon: Focus,
      label: 'Modo Foco',
      color: 'bg-purple-600 hover:bg-purple-700',
      show: currentSection === 'chat' && hasActiveChat
    },
    {
      id: 'toggle-sidebar',
      icon: Sidebar,
      label: 'Toggle Conversas',
      color: 'bg-gray-600 hover:bg-gray-700',
      show: currentSection === 'chat'
    },
    {
      id: 'quick-action',
      icon: Zap,
      label: 'Ação Rápida',
      color: 'bg-orange-600 hover:bg-orange-700',
      show: hasDocument
    }
  ];

  const visibleActions = actions.filter(action => action.show);

  const handleMainAction = () => {
    if (visibleActions.length === 1) {
      onAction(visibleActions[0].id);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={cn(
      "fixed right-4 z-50 flex flex-col-reverse items-end space-y-reverse space-y-3",
      // Add safe area support for iOS
      "pb-safe-area-bottom",
      className
    )}>
      {/* Action Buttons */}
      {isExpanded && visibleActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            onClick={() => {
              onAction(action.id);
              setIsExpanded(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full shadow-lg transition-all duration-200 text-white",
              action.color,
              "animate-scale-in"
            )}
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            <Icon className="w-5 h-5" />
          </Button>
        );
      })}

      {/* Main Button */}
      <Button
        onClick={handleMainAction}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-200 text-white",
          isExpanded 
            ? "bg-red-600 hover:bg-red-700 rotate-45" 
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        <Plus className={cn("w-6 h-6 transition-transform duration-200", isExpanded && "rotate-45")} />
      </Button>
    </div>
  );
};

export default FloatingActionButton;

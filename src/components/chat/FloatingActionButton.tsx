
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Focus, FileText } from 'lucide-react';

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
  const [showActions, setShowActions] = useState(false);

  const actions = [
    {
      id: 'new-chat',
      label: 'Nova conversa',
      icon: MessageSquare,
      show: currentSection === 'chat'
    },
    {
      id: 'focus-mode',
      label: 'Focus Mode',
      icon: Focus,
      show: currentSection === 'chat' && hasActiveChat
    },
    {
      id: 'new-document',
      label: 'Novo documento',
      icon: FileText,
      show: currentSection === 'documents'
    }
  ];

  const visibleActions = actions.filter(action => action.show);

  const handleMainAction = () => {
    if (visibleActions.length === 1) {
      onAction(visibleActions[0].id);
    } else {
      setShowActions(!showActions);
    }
  };

  const handleActionSelect = (actionId: string) => {
    onAction(actionId);
    setShowActions(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Action Menu */}
      {showActions && visibleActions.length > 1 && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 mb-2">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => handleActionSelect(action.id)}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 flex items-center gap-2"
                size="sm"
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={handleMainAction}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        size="lg"
      >
        <Plus className={`w-6 h-6 transition-transform ${showActions ? 'rotate-45' : ''}`} />
      </Button>
    </div>
  );
};

export default FloatingActionButton;


import { useState } from 'react';
import { AtSign, Hash, Paperclip, Smile } from 'lucide-react';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import QuickActionButton from './QuickActionButton';

interface QuickAction {
  id: string;
  icon: typeof AtSign;
  label: string;
  text?: string;
  action?: string;
  description: string;
}

interface QuickActionsBarProps {
  onInsertText: (text: string) => void;
  onAttachment: () => void;
}

const QuickActionsBar = ({ onInsertText, onAttachment }: QuickActionsBarProps) => {
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
  const { hapticFeedback } = useMobileOptimization();

  const quickActions: QuickAction[] = [
    {
      id: 'mention',
      icon: AtSign,
      label: '@',
      text: '@',
      description: 'Mencionar'
    },
    {
      id: 'filter',
      icon: Hash,
      label: '/',
      text: '/',
      description: 'Filtro'
    },
    {
      id: 'attachment',
      icon: Paperclip,
      label: 'Anexo',
      action: 'attachment',
      description: 'Anexar'
    },
    {
      id: 'emoji',
      icon: Smile,
      label: '😊',
      text: '😊',
      description: 'Emoji'
    }
  ];

  const handleQuickAction = (action: QuickAction) => {
    setSelectedQuickAction(action.id);
    hapticFeedback('light');
    
    setTimeout(() => {
      setSelectedQuickAction(null);
      
      if (action.action === 'attachment') {
        onAttachment();
      } else if (action.text) {
        onInsertText(action.text);
      }
    }, 100);
  };

  return (
    <div className="flex items-center space-x-2">
      {quickActions.map((action) => (
        <QuickActionButton
          key={action.id}
          id={action.id}
          icon={action.icon}
          label={action.label}
          description={action.description}
          isSelected={selectedQuickAction === action.id}
          onTouchStart={() => setSelectedQuickAction(action.id)}
          onTouchEnd={() => handleQuickAction(action)}
        />
      ))}
    </div>
  );
};

export default QuickActionsBar;

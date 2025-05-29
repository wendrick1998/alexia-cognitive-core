
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AtSign, Hash, Paperclip, Check, X, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface MobileKeyboardAccessoryProps {
  onInsertText: (text: string) => void;
  onDone: () => void;
  onCancel: () => void;
  onAttachment: () => void;
  isVisible: boolean;
}

const MobileKeyboardAccessory = ({
  onInsertText,
  onDone,
  onCancel,
  onAttachment,
  isVisible
}: MobileKeyboardAccessoryProps) => {
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
  const { hapticFeedback, deviceInfo } = useMobileOptimization();

  const quickActions = [
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

  const handleQuickAction = (action: any) => {
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

  const handleDone = () => {
    hapticFeedback('medium');
    onDone();
  };

  const handleCancel = () => {
    hapticFeedback('light');
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300",
        "bg-gray-900/95 backdrop-blur-xl border-t border-white/10",
        deviceInfo.os === 'iOS' && "bottom-[env(keyboard-inset-height,0px)]"
      )}
      style={{
        bottom: deviceInfo.os === 'iOS' 
          ? 'env(keyboard-inset-height, 0px)' 
          : '0px'
      }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isSelected = selectedQuickAction === action.id;
            
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onTouchStart={() => setSelectedQuickAction(action.id)}
                onTouchEnd={() => handleQuickAction(action)}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                  "touch-manipulation text-white/70 hover:text-white hover:bg-white/10",
                  isSelected && "scale-95 bg-white/20 text-white"
                )}
                style={{
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <Icon className="w-5 h-5" />
              </Button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onTouchEnd={handleCancel}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
              "touch-manipulation text-white/70 hover:text-white hover:bg-white/10"
            )}
            style={{
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Cancelar</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onTouchEnd={handleDone}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
              "touch-manipulation bg-blue-600 text-white hover:bg-blue-700"
            )}
            style={{
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Enviar</span>
          </Button>
        </div>
      </div>

      {/* Gesture hint */}
      <div className="flex justify-center pb-1">
        <div className="w-8 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
};

export default MobileKeyboardAccessory;


import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardActionButtonsProps {
  onCancel: () => void;
  onDone: () => void;
}

const KeyboardActionButtons = ({ onCancel, onDone }: KeyboardActionButtonsProps) => {
  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="ghost"
        size="sm"
        onTouchEnd={onCancel}
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
        onTouchEnd={onDone}
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
  );
};

export default KeyboardActionButtons;


import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardActionButtonsProps {
  onCancel: () => void;
  onDone: () => void;
}

const KeyboardActionButtons = ({ onCancel, onDone }: KeyboardActionButtonsProps) => {
  const handleCancelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleDoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDone();
    }
  };

  return (
    <div className="flex items-center space-x-3" role="group" aria-label="Ações do teclado">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        onKeyDown={handleCancelKeyDown}
        aria-label="Cancelar entrada de texto"
        role="button"
        tabIndex={0}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
          "btn-accessible focus-ring-enhanced touch-target-48",
          "touch-manipulation text-white/70 hover:text-white hover:bg-white/10"
        )}
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <X className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm">Cancelar</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onDone}
        onKeyDown={handleDoneKeyDown}
        aria-label="Enviar mensagem"
        role="button"
        tabIndex={0}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
          "btn-accessible focus-ring-enhanced touch-target-48",
          "touch-manipulation bg-blue-600 text-white hover:bg-blue-700"
        )}
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <Check className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">Enviar</span>
      </Button>
    </div>
  );
};

export default KeyboardActionButtons;

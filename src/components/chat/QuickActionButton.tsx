
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  isSelected: boolean;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onClick?: () => void;
}

const QuickActionButton = ({
  id,
  icon: Icon,
  label,
  description,
  isSelected,
  onTouchStart,
  onTouchEnd,
  onClick
}: QuickActionButtonProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${label}: ${description}`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={0}
      className={cn(
        "touch-target-48 rounded-xl transition-all duration-200",
        "btn-accessible focus-ring-enhanced",
        "touch-manipulation text-white/70 hover:text-white hover:bg-white/10",
        isSelected && "scale-95 bg-white/20 text-white"
      )}
      style={{
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="sr-only">{description}</span>
    </Button>
  );
};

export default QuickActionButton;

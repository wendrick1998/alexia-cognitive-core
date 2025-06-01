
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
}

const QuickActionButton = ({
  id,
  icon: Icon,
  label,
  description,
  isSelected,
  onTouchStart,
  onTouchEnd
}: QuickActionButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
};

export default QuickActionButton;

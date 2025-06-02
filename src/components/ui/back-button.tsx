
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  onClick: () => void;
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
  text?: string;
  icon?: 'chevron' | 'arrow';
  className?: string;
  disabled?: boolean;
}

const BackButton = ({
  onClick,
  variant = 'ghost',
  size = 'default',
  showText = true,
  text = 'Voltar',
  icon = 'chevron',
  className,
  disabled = false
}: BackButtonProps) => {
  const IconComponent = icon === 'chevron' ? ChevronLeft : ArrowLeft;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={showText ? text : 'Voltar'}
      role="button"
      tabIndex={0}
      className={cn(
        'transition-all duration-200 hover:scale-105',
        'btn-accessible focus-ring-enhanced touch-target-48',
        'focus:ring-2 focus:ring-blue-500/20',
        disabled && 'btn-state-disabled',
        className
      )}
    >
      <IconComponent className="w-4 h-4" aria-hidden="true" />
      {showText && <span className="ml-1">{text}</span>}
    </Button>
  );
};

export default BackButton;

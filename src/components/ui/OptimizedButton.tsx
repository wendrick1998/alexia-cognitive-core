
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptimizedButtonProps extends ButtonProps {
  'aria-label': string;
  icon?: React.ReactNode;
  loading?: boolean;
}

const OptimizedButton = React.forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  ({ className, children, icon, loading, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'min-h-[48px] min-w-[48px] transition-all duration-200 ease-in-out',
          'hover:scale-105 active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          className
        )}
        aria-label={ariaLabel}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </Button>
    );
  }
);

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton;

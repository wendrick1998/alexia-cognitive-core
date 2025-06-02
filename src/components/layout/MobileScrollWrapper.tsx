
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileScrollWrapperProps {
  children: ReactNode;
  className?: string;
}

export function MobileScrollWrapper({ children, className }: MobileScrollWrapperProps) {
  return (
    <div className={cn(
      "scrollable-content h-full overflow-y-auto overscroll-contain",
      "touch-manipulation webkit-overflow-auto",
      className
    )}>
      {children}
    </div>
  );
}

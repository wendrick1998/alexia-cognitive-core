
/**
 * @description Input component otimizado com melhor acessibilidade
 * @created_by Performance Optimization Sprint
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  floating?: boolean;
  'aria-label'?: string;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, label, icon, floating = false, 'aria-label': ariaLabel, ...props }, ref) => {
    const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    if (floating) {
      return (
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            id={id}
            className={cn(
              'peer placeholder-transparent',
              'focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2',
              'transition-all duration-200 ease-in-out',
              icon && 'pl-10',
              className
            )}
            placeholder={label || ' '}
            aria-label={ariaLabel || label}
            {...props}
          />
          {label && (
            <Label
              htmlFor={id}
              className={cn(
                'absolute left-3 transition-all duration-200 ease-in-out',
                'text-gray-400 pointer-events-none',
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base',
                'peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400',
                'top-2 text-xs',
                icon && 'peer-placeholder-shown:left-10 peer-focus:left-3'
              )}
            >
              {label}
            </Label>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium text-white/90">
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            id={id}
            className={cn(
              'focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2',
              'transition-all duration-200 ease-in-out',
              icon && 'pl-10',
              className
            )}
            aria-label={ariaLabel || label}
            {...props}
          />
        </div>
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;

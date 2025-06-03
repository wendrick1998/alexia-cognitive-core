
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import * as React from 'react';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  floating?: boolean;
}

const EnhancedInput = ({
  label,
  error,
  hint,
  icon,
  floating = false,
  className,
  ...props
}: EnhancedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  if (floating) {
    return (
      <div className="relative">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </div>
          )}
          
          <Input
            className={cn(
              'peer placeholder-transparent transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            placeholder={label || props.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {label && (
            <motion.label
              className={cn(
                'absolute left-3 text-gray-500 transition-all duration-200 pointer-events-none',
                icon && 'left-10',
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base',
                'peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-blue-500',
                (isFocused || hasValue) && 'top-2 -translate-y-0 text-xs text-blue-500'
              )}
              animate={{
                y: isFocused || hasValue ? -8 : 0,
                scale: isFocused || hasValue ? 0.85 : 1,
                color: isFocused ? '#3b82f6' : '#6b7280'
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
        
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 mt-1"
          >
            {hint}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
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
          className={cn(
            'transition-all duration-200',
            icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
      
      {hint && !error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500"
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
};

export default EnhancedInput;

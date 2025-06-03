
/**
 * @description Botão otimizado com feedback visual aprimorado
 * @created_by Fase 2 - Otimização UX
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  successFeedback?: boolean;
  hapticFeedback?: boolean;
  pulseOnHover?: boolean;
}

export function OptimizedButton({
  children,
  loading = false,
  loadingText,
  successFeedback = false,
  hapticFeedback = true,
  pulseOnHover = true,
  className,
  onClick,
  disabled,
  ...props
}: OptimizedButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Haptic feedback em dispositivos móveis
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (onClick) {
      try {
        const result = await onClick(e);
        
        if (successFeedback) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 1500);
        }
      } catch (error) {
        console.error('Button action failed:', error);
      }
    }
  };

  const motionProps = pulseOnHover ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  } : {};

  return (
    <motion.div {...motionProps}>
      <Button
        {...props}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          showSuccess && 'bg-green-600 hover:bg-green-700',
          className
        )}
      >
        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-current/10 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingText && (
                <span className="text-sm">{loadingText}</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Success state */}
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
            >
              <svg
                className="w-3 h-3 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Conteúdo normal */}
        <span className={cn(
          'transition-opacity duration-200',
          (loading || showSuccess) && 'opacity-0'
        )}>
          {children}
        </span>
      </Button>
    </motion.div>
  );
}

export default OptimizedButton;


import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
  pulse?: boolean;
  'aria-label': string;
}

const EnhancedButton = ({
  children,
  loading = false,
  loadingText,
  icon,
  gradient = false,
  pulse = false,
  className,
  disabled,
  'aria-label': ariaLabel,
  ...props
}: EnhancedButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Button
        className={cn(
          'relative overflow-hidden min-h-[48px] min-w-[48px]',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2',
          gradient && 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
          pulse && 'animate-pulse',
          className
        )}
        disabled={isDisabled}
        aria-label={ariaLabel}
        {...props}
      >
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 bg-white/10"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        
        {/* Content */}
        <div className="relative flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingText || 'Carregando...'}
            </>
          ) : (
            <>
              {icon && icon}
              {children}
            </>
          )}
        </div>
      </Button>
    </motion.div>
  );
};

export default EnhancedButton;

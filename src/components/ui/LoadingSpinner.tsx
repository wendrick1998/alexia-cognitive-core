
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
}

const LoadingSpinner = ({ size = 'medium', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center space-y-3', className)}>
      <motion.div
        className={cn(
          'border-2 border-blue-500/30 border-t-blue-500 rounded-full',
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;


import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationToastProps {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'ai';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
  ai: Zap,
};

const colors = {
  success: 'text-green-500 bg-green-500/10 border-green-500/20',
  error: 'text-red-500 bg-red-500/10 border-red-500/20',
  warning: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  info: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  ai: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
};

export const showNotification = ({
  title,
  description,
  type = 'info',
  duration = 5000,
  action,
}: NotificationToastProps) => {
  const Icon = icons[type];
  
  const toastId = toast.custom(
    () => (
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={cn(
          'max-w-sm w-full p-4 rounded-lg shadow-lg backdrop-blur-xl border',
          'bg-gray-900/90 border-gray-700/50 text-white',
          colors[type]
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn('flex-shrink-0 p-1 rounded-full', colors[type])}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 space-y-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            {description && (
              <p className="text-sm text-gray-300">{description}</p>
            )}
            
            {action && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                {action.label}
              </motion.button>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toast.dismiss(toastId)}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    ),
    { duration }
  );

  return toastId;
};

export default showNotification;

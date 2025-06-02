
import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[toast.type];

  const typeStyles = {
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
  };

  const iconStyles = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      className={cn(
        'toast-premium',
        'flex items-start space-x-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        typeStyles[toast.type],
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

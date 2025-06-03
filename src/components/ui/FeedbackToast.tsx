
/**
 * @description Sistema de toast inteligente com feedback contextual
 * @created_by Fase 2 - Otimização UX
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from './button';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
  persistent?: boolean;
}

interface FeedbackToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const getToastStyles = (type: string) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle,
        colors: 'bg-green-900/90 border-green-500/50 text-green-100',
        iconColor: 'text-green-400'
      };
    case 'error':
      return {
        icon: XCircle,
        colors: 'bg-red-900/90 border-red-500/50 text-red-100',
        iconColor: 'text-red-400'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        colors: 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100',
        iconColor: 'text-yellow-400'
      };
    default:
      return {
        icon: Info,
        colors: 'bg-blue-900/90 border-blue-500/50 text-blue-100',
        iconColor: 'text-blue-400'
      };
  }
};

export function FeedbackToast({ toast, onDismiss }: FeedbackToastProps) {
  const { icon: Icon, colors, iconColor } = getToastStyles(toast.type);

  const handleDismiss = () => {
    onDismiss(toast.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.95 }}
      className={`
        relative max-w-md w-full backdrop-blur-sm border rounded-lg p-4 shadow-lg
        ${colors}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
          
          {toast.actions && toast.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {toast.actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  className="h-7 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {!toast.persistent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progresso de auto-dismiss */}
      {!toast.persistent && toast.duration && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

export default FeedbackToast;

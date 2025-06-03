
/**
 * @description Sistema de notificações otimizado
 * @created_by Performance Optimization Sprint
 */

import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export interface NotificationOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    default:
      return <Info className="w-5 h-5 text-gray-500" />;
  }
};

export const showNotification = ({
  title,
  description,
  type = 'info',
  duration = 4000,
  action
}: NotificationOptions) => {
  const icon = getIcon(type);

  toast(title, {
    description,
    duration,
    icon,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    className: 'bg-gray-900/95 backdrop-blur-sm border-gray-700/50',
    style: {
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      color: 'white',
    },
  });
};

// Atalhos para tipos específicos
export const showSuccess = (title: string, description?: string) => 
  showNotification({ title, description, type: 'success' });

export const showError = (title: string, description?: string) => 
  showNotification({ title, description, type: 'error' });

export const showWarning = (title: string, description?: string) => 
  showNotification({ title, description, type: 'warning' });

export const showInfo = (title: string, description?: string) => 
  showNotification({ title, description, type: 'info' });


import { useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/ui/toast-premium';

let toastCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    description?: string,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    const id = `toast-${++toastCounter}`;
    const toast: Toast = {
      id,
      type,
      title,
      description,
      duration: options?.duration,
      action: options?.action,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, description?: string, options?: any) => 
    addToast('success', title, description, options), [addToast]);

  const error = useCallback((title: string, description?: string, options?: any) => 
    addToast('error', title, description, options), [addToast]);

  const warning = useCallback((title: string, description?: string, options?: any) => 
    addToast('warning', title, description, options), [addToast]);

  const info = useCallback((title: string, description?: string, options?: any) => 
    addToast('info', title, description, options), [addToast]);

  return {
    toasts,
    addToast,
    dismissToast,
    dismissAll,
    success,
    error,
    warning,
    info,
  };
};

// Global toast instance for use outside components
let globalToast: ReturnType<typeof useToast> | null = null;

export const setGlobalToast = (toast: ReturnType<typeof useToast>) => {
  globalToast = toast;
};

export const toast = {
  success: (title: string, description?: string, options?: any) => 
    globalToast?.success(title, description, options),
  error: (title: string, description?: string, options?: any) => 
    globalToast?.error(title, description, options),
  warning: (title: string, description?: string, options?: any) => 
    globalToast?.warning(title, description, options),
  info: (title: string, description?: string, options?: any) => 
    globalToast?.info(title, description, options),
};

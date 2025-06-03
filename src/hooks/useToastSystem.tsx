
/**
 * @description Hook para sistema de toast inteligente
 * @created_by Fase 2 - Otimização UX
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ToastData } from '@/components/ui/FeedbackToast';

export function useToastSystem() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToast = useCallback((
    toast: Omit<ToastData, 'id'> & { id?: string }
  ) => {
    const id = toast.id || generateId();
    const duration = toast.duration || 5000;

    const newToast: ToastData = {
      duration,
      ...toast,
      id
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss se não for persistente
    if (!toast.persistent) {
      const timeout = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  // Atalhos para tipos específicos
  const success = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<ToastData>) => {
    return addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  // Limpeza na desmontagem
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };
}

export default useToastSystem;

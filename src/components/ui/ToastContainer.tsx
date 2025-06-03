
/**
 * @description Container para renderizar toasts
 * @created_by Fase 2 - Otimização UX
 */

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { FeedbackToast, ToastData } from './FeedbackToast';

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const getPositionClasses = (position: string) => {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    default:
      return 'top-4 right-4';
  }
};

export function ToastContainer({ 
  toasts, 
  onDismiss, 
  position = 'top-right' 
}: ToastContainerProps) {
  return (
    <div className={`fixed z-50 ${getPositionClasses(position)}`}>
      <div className="space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <FeedbackToast
              key={toast.id}
              toast={toast}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ToastContainer;

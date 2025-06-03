
/**
 * @description Spinner de carregamento inteligente com tipos específicos
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import React from 'react';
import { Loader2, Brain, Database, MessageSquare, Activity } from 'lucide-react';

interface SmartLoadingSpinnerProps {
  type?: 'general' | 'chat' | 'cognitive' | 'database';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SmartLoadingSpinner({ 
  type = 'general', 
  message = 'Carregando...',
  size = 'md'
}: SmartLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getIcon = () => {
    switch (type) {
      case 'chat':
        return <MessageSquare className={`${sizeClasses[size]} animate-pulse`} />;
      case 'cognitive':
        return <Brain className={`${sizeClasses[size]} animate-pulse`} />;
      case 'database':
        return <Database className={`${sizeClasses[size]} animate-pulse`} />;
      default:
        return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-blue-600">
        {getIcon()}
      </div>
      {message && (
        <p className="text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

export default SmartLoadingSpinner;


/**
 * @description Loading spinner inteligente com contexto
 * @created_by Fase 2 - Otimização UX
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Database, MessageSquare } from 'lucide-react';

interface SmartLoadingSpinnerProps {
  type?: 'chat' | 'cognitive' | 'database' | 'general';
  message?: string;
  progress?: number;
  className?: string;
}

const getIconAndColor = (type: string) => {
  switch (type) {
    case 'chat':
      return { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    case 'cognitive':
      return { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/20' };
    case 'database':
      return { icon: Database, color: 'text-green-400', bg: 'bg-green-500/20' };
    default:
      return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  }
};

const getContextualMessage = (type: string) => {
  switch (type) {
    case 'chat':
      return 'Processando sua mensagem...';
    case 'cognitive':
      return 'Analisando conexões cognitivas...';
    case 'database':
      return 'Consultando base de conhecimento...';
    default:
      return 'Carregando...';
  }
};

export function SmartLoadingSpinner({ 
  type = 'general', 
  message, 
  progress,
  className = '' 
}: SmartLoadingSpinnerProps) {
  const { icon: Icon, color, bg } = getIconAndColor(type);
  const displayMessage = message || getContextualMessage(type);

  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <div className="text-center space-y-4">
        {/* Spinner animado */}
        <div className="relative">
          <motion.div
            className={`w-16 h-16 rounded-full border-4 border-transparent ${bg}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className={`absolute top-0 w-16 h-16 rounded-full border-4 border-t-transparent ${color.replace('text-', 'border-')}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>

        {/* Progresso (se fornecido) */}
        {progress !== undefined && (
          <div className="w-48 bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${color.replace('text-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Mensagem contextual */}
        <div className="space-y-2">
          <motion.p
            className="text-white font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {displayMessage}
          </motion.p>
          
          {progress !== undefined && (
            <p className="text-white/60 text-sm">
              {Math.round(progress)}% concluído
            </p>
          )}
        </div>

        {/* Pontos animados */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SmartLoadingSpinner;

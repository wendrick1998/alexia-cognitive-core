/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Componente para indicar fonte da resposta (cache ou fallback)
 * Implementa indicadores visuais para melhorar transparência do sistema multi-LLM
 */

import React from 'react';
import { Clock, RefreshCw, Zap, Server } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ResponseSourceProps {
  fromCache?: boolean;
  usedFallback?: boolean;
  originalModel?: string;
  currentModel?: string;
  responseTime?: number;
  className?: string;
}

/**
 * Componente que exibe indicadores visuais sobre a fonte da resposta LLM
 * Mostra se a resposta veio do cache ou se houve fallback entre modelos
 */
export const ResponseSource: React.FC<ResponseSourceProps> = ({
  fromCache = false,
  usedFallback = false,
  originalModel = '',
  currentModel = '',
  responseTime = 0,
  className = '',
}) => {
  // Se não houver informações especiais, não renderizar nada
  if (!fromCache && !usedFallback) {
    return null;
  }
  
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs mt-2 ${className}`}>
      {fromCache && (
        <Tooltip content={`Resposta recuperada do cache semântico (${responseTime}ms)`}>
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3" />
            <span>Cache</span>
          </Badge>
        </Tooltip>
      )}
      
      {usedFallback && (
        <Tooltip content={`Fallback de ${originalModel} para ${currentModel}`}>
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800">
            <RefreshCw className="w-3 h-3" />
            <span>Fallback</span>
          </Badge>
        </Tooltip>
      )}
      
      {!fromCache && !usedFallback && responseTime > 0 && responseTime < 500 && (
        <Tooltip content={`Resposta rápida (${responseTime}ms)`}>
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
            <Zap className="w-3 h-3" />
            <span>Rápido</span>
          </Badge>
        </Tooltip>
      )}
      
      {currentModel && (
        <Tooltip content={`Modelo: ${currentModel}`}>
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
            <Server className="w-3 h-3" />
            <span>{currentModel.split('-')[0]}</span>
          </Badge>
        </Tooltip>
      )}
    </div>
  );
};

export default ResponseSource;

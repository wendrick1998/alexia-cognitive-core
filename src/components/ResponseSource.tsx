
import React from 'react';
import { Clock, RefreshCw, Zap, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ResponseSourceProps {
  fromCache?: boolean;
  usedFallback?: boolean;
  originalModel?: string;
  currentModel?: string;
  responseTime?: number;
  className?: string;
}

const ResponseSource: React.FC<ResponseSourceProps> = ({
  fromCache = false,
  usedFallback = false,
  originalModel = '',
  currentModel = '',
  responseTime = 0,
  className = '',
}) => {
  // Se não houver informações especiais, não renderizar nada
  if (!fromCache && !usedFallback && !responseTime) {
    return null;
  }
  
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs mt-2 ${className}`}>
      {fromCache && (
        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Clock className="w-3 h-3" />
          <span>Cache ({responseTime}ms)</span>
        </Badge>
      )}
      
      {usedFallback && (
        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 border-amber-500/30">
          <RefreshCw className="w-3 h-3" />
          <span>Fallback</span>
        </Badge>
      )}
      
      {!fromCache && !usedFallback && responseTime > 0 && responseTime < 500 && (
        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 border-green-500/30">
          <Zap className="w-3 h-3" />
          <span>Rápido ({responseTime}ms)</span>
        </Badge>
      )}
      
      {currentModel && (
        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-white/10 text-white/70 border-white/20">
          <Server className="w-3 h-3" />
          <span>{currentModel.split('-')[0]}</span>
        </Badge>
      )}
    </div>
  );
};

export default ResponseSource;

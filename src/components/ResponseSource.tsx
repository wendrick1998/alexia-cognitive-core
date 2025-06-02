
import React from 'react';
import { Clock, RefreshCw, Zap, Server, TrendingUp } from 'lucide-react';
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
  
  const getPerformanceBadge = () => {
    if (fromCache) {
      return (
        <Badge variant="outline" className="badge-info">
          <Clock className="w-3 h-3 mr-1" />
          Cache ({responseTime}ms)
        </Badge>
      );
    }
    
    if (usedFallback) {
      return (
        <Badge variant="outline" className="badge-warning">
          <RefreshCw className="w-3 h-3 mr-1" />
          Fallback
        </Badge>
      );
    }
    
    if (responseTime > 0) {
      if (responseTime < 500) {
        return (
          <Badge variant="outline" className="badge-success">
            <Zap className="w-3 h-3 mr-1" />
            Rápido ({responseTime}ms)
          </Badge>
        );
      } else if (responseTime < 2000) {
        return (
          <Badge variant="outline" className="badge-info">
            <TrendingUp className="w-3 h-3 mr-1" />
            Normal ({responseTime}ms)
          </Badge>
        );
      } else {
        return (
          <Badge variant="outline" className="badge-warning">
            <Clock className="w-3 h-3 mr-1" />
            Lento ({responseTime}ms)
          </Badge>
        );
      }
    }
    
    return null;
  };
  
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs mt-2 ${className}`}>
      {getPerformanceBadge()}
      
      {currentModel && (
        <Badge variant="outline" className="badge-primary">
          <Server className="w-3 h-3 mr-1" />
          {currentModel.split('-')[0]}
        </Badge>
      )}
    </div>
  );
};

export default ResponseSource;

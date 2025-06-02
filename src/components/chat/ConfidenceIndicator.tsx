
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Brain, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  confidenceScore: number;
  contextsUsed: number;
  validationStatus?: 'reliable' | 'unreliable' | 'needs_review' | 'pending';
  memoryNodes?: Array<{
    id: string;
    title?: string;
    node_type: string;
    relevance_score: number;
  }>;
  className?: string;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidenceScore,
  contextsUsed,
  validationStatus = 'pending',
  memoryNodes = [],
  className
}) => {
  if (contextsUsed === 0) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'reliable':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unreliable':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'needs_review':
        return <Shield className="w-4 h-4 text-yellow-600" />;
      default:
        return <Brain className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reliable': return 'Confiável';
      case 'unreliable': return 'Não confiável';
      case 'needs_review': return 'Requer revisão';
      default: return 'Validando...';
    }
  };

  return (
    <Card className={cn("p-3 mt-2 bg-white/80 backdrop-blur-sm border", className)}>
      <div className="space-y-2">
        {/* Cabeçalho com confiança */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Memória Cognitiva Ativa
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-xs", getConfidenceColor(confidenceScore))}
          >
            {Math.round(confidenceScore * 100)}% confiança
          </Badge>
        </div>

        {/* Status e contextos */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            {getValidationIcon(validationStatus)}
            <span className="text-gray-600">
              {getStatusText(validationStatus)}
            </span>
          </div>
          <span className="text-gray-500">
            {contextsUsed} contexto{contextsUsed !== 1 ? 's' : ''} utilizado{contextsUsed !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Nós de memória utilizados */}
        {memoryNodes.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              Ver contextos utilizados ({memoryNodes.length})
            </summary>
            <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
              {memoryNodes.slice(0, 3).map((node) => (
                <div key={node.id} className="flex items-center justify-between">
                  <span className="text-gray-700 truncate">
                    {node.title || `${node.node_type} node`}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(node.relevance_score * 100)}%
                  </Badge>
                </div>
              ))}
              {memoryNodes.length > 3 && (
                <div className="text-gray-500">
                  +{memoryNodes.length - 3} contextos adicionais
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </Card>
  );
};

export default ConfidenceIndicator;

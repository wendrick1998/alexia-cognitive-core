
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Brain, Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemoryIndicatorProps {
  memoryUsed: boolean;
  confidenceScore: number;
  contextsFound: number;
  validationStatus?: 'reliable' | 'unreliable' | 'needs_review' | 'pending';
  className?: string;
}

const MemoryIndicator = ({
  memoryUsed,
  confidenceScore,
  contextsFound,
  validationStatus = 'pending',
  className
}: MemoryIndicatorProps) => {
  if (!memoryUsed && contextsFound === 0) return null;

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'reliable':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'unreliable':
        return <Shield className="w-3 h-3 text-red-600" />;
      case 'needs_review':
        return <TrendingUp className="w-3 h-3 text-yellow-600" />;
      default:
        return <Brain className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <Card className={cn("p-2 mt-2 bg-gray-50/50 border-gray-200/50", className)}>
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3 text-blue-600" />
          <span className="text-gray-600">
            {contextsFound} contexto{contextsFound !== 1 ? 's' : ''} utilizado{contextsFound !== 1 ? 's' : ''}
          </span>
        </div>
        
        <Badge 
          variant="outline" 
          className={cn("text-xs", getConfidenceColor(confidenceScore))}
        >
          {Math.round(confidenceScore * 100)}% confiança
        </Badge>

        <div className="flex items-center gap-1">
          {getValidationIcon(validationStatus)}
          <span className="text-gray-500 capitalize">
            {validationStatus === 'needs_review' ? 'revisar' : validationStatus}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MemoryIndicator;

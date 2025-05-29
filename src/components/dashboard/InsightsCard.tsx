
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  Brain, 
  Zap,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  content: string;
  type: string;
  confidence: number;
  createdAt: string;
  status: 'pending' | 'viewed' | 'applied';
}

interface InsightsCardProps {
  insights: Insight[];
  loading: boolean;
  error?: string | null;
}

const InsightsCard = ({ insights, loading, error }: InsightsCardProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <TrendingUp className="w-4 h-4" />;
      case 'trend':
        return <Zap className="w-4 h-4" />;
      case 'consolidation':
        return <Brain className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'viewed':
        return 'bg-blue-500/20 text-blue-300';
      case 'applied':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <PremiumCard variant="elevated" className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Insights Recentes</h3>
            <p className="text-white/50 text-sm">Carregando...</p>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </PremiumCard>
    );
  }

  if (error) {
    return (
      <PremiumCard variant="elevated" className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Insights Recentes</h3>
            <p className="text-red-300 text-sm">Erro ao carregar</p>
          </div>
        </div>
        <div className="text-center py-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 mb-4">Falha ao carregar insights</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
            className="border-red-400 text-red-300 hover:bg-red-500/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard variant="elevated" className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Insights Recentes</h3>
          <p className="text-white/50 text-sm">Descobertas automáticas</p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">Nenhum insight disponível</p>
          <p className="text-white/30 text-sm mt-1">
            Continue usando o sistema para gerar insights
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <span className="text-white font-medium text-sm">
                    {insight.title}
                  </span>
                </div>
                <Badge className={`text-xs ${getStatusColor(insight.status)}`}>
                  {insight.status}
                </Badge>
              </div>
              
              <p className="text-white/70 text-sm mb-2">
                {insight.content}
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">
                  {new Date(insight.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300">
                    {Math.round(insight.confidence * 100)}% confiança
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PremiumCard>
  );
};

export default InsightsCard;

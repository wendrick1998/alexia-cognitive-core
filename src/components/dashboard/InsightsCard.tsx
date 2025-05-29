
import { PremiumCard } from '@/components/ui/premium-card';
import { SkeletonPremium } from '@/components/ui/skeleton-premium';
import { Lightbulb, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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
}

const InsightsCard = ({ insights, loading }: InsightsCardProps) => {
  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 0) return `há ${diffHours}h`;
    if (diffMinutes > 0) return `há ${diffMinutes}m`;
    return 'agora';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'viewed':
        return <Clock className="w-3 h-3 text-blue-400" />;
      default:
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'border-l-green-500 bg-green-500/5';
      case 'viewed':
        return 'border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-yellow-500 bg-yellow-500/5';
    }
  };

  if (loading) {
    return (
      <PremiumCard variant="elevated" className="h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Insights Recentes</h3>
            <p className="text-white/50 text-sm">Descobertas da IA</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonPremium key={i} className="h-16" />
          ))}
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard variant="elevated" className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Insights Recentes</h3>
          <p className="text-white/50 text-sm">Descobertas da IA</p>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum insight disponível</p>
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border-l-2 transition-all duration-200 hover:bg-white/5 cursor-pointer ${getStatusColor(insight.status)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(insight.status)}
                    <h4 className="text-white text-sm font-medium truncate">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-white/70 text-xs line-clamp-2">
                    {insight.content}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-xs">
                    {getTimeAgo(insight.createdAt)}
                  </div>
                  <div className="text-white/40 text-xs">
                    {Math.round(insight.confidence * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </PremiumCard>
  );
};

export default InsightsCard;

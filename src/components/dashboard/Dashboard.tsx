
import { useState } from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { SkeletonPremium } from '@/components/ui/skeleton-premium';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecentInsights } from '@/hooks/useRecentInsights';
import { useAuth } from '@/hooks/useAuth';
import ActivityChart from './ActivityChart';
import MemoryCard from './MemoryCard';
import ConversationCard from './ConversationCard';
import AIUsageCard from './AIUsageCard';
import InsightsCard from './InsightsCard';
import ObjectivesCard from './ObjectivesCard';
import { 
  BarChart3, 
  Brain, 
  MessageCircle, 
  Bot, 
  Lightbulb, 
  Target,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, activityData, loading: statsLoading } = useDashboardStats();
  const { insights, loading: insightsLoading } = useRecentInsights();
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.email?.split('@')[0] || 'Usuário';
    
    if (hour < 12) return `Bom dia, ${name}`;
    if (hour < 18) return `Boa tarde, ${name}`;
    return `Boa noite, ${name}`;
  };

  const getDaySummary = () => {
    if (statsLoading) return "Carregando resumo do dia...";
    
    const today = new Date().toISOString().split('T')[0];
    const todayActivity = activityData.find(data => data.date === today);
    const todayMessages = todayActivity?.messages || 0;
    
    return `Você teve ${todayMessages} mensagens e ${stats.totalMemories} memórias ativas hoje`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  if (statsLoading) {
    return (
      <div className="h-full p-6 space-y-6 animate-premium-fade-in">
        <div className="space-y-4">
          <SkeletonPremium className="h-8 w-64" variant="text" />
          <SkeletonPremium className="h-4 w-96" variant="text" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPremium key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6 animate-premium-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold gradient-text">
              {getGreeting()}
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <p className="text-white/60 text-lg">
            {getDaySummary()}
          </p>
          
          <div className="flex gap-4 flex-wrap">
            <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
              {stats.totalMessages} msgs
            </div>
            <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
              {stats.totalDocuments} docs
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
              {insights.length} insights
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Activity Chart - Largo */}
          <div className="md:col-span-2">
            <PremiumCard variant="elevated" className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Atividade</h3>
                  <p className="text-white/50 text-sm">Últimos 7 dias</p>
                </div>
              </div>
              <ActivityChart data={activityData} />
            </PremiumCard>
          </div>

          {/* Memory Card */}
          <MemoryCard totalMemories={stats.totalMemories} />

          {/* Conversation Card */}
          <ConversationCard 
            totalConversations={stats.totalConversations}
            avgMessages={stats.avgMessagesPerConversation}
          />

          {/* AI Usage Card */}
          <AIUsageCard 
            tokensUsed={stats.tokensUsed}
            tokenLimit={stats.tokenLimit}
          />

          {/* Insights Card - Largo */}
          <div className="md:col-span-2">
            <InsightsCard insights={insights} loading={insightsLoading} />
          </div>

          {/* Objectives Card */}
          <ObjectivesCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

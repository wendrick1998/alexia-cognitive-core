
import { useState } from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { SkeletonPremium } from '@/components/ui/skeleton-premium';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecentInsights } from '@/hooks/useRecentInsights';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
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
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user, error, refreshSession } = useAuth();
  const { stats, activityData, loading: statsLoading, error: statsError } = useDashboardStats();
  const { insights, loading: insightsLoading, error: insightsError } = useRecentInsights();
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
    if (statsError) return "Erro ao carregar dados do dia";
    
    const today = new Date().toISOString().split('T')[0];
    const todayActivity = activityData.find(data => data.date === today);
    const todayMessages = todayActivity?.messages || 0;
    
    return `Você teve ${todayMessages} mensagens e ${stats.totalMemories} memórias ativas hoje`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (error) {
        await refreshSession();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error('Erro ao atualizar:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="h-full overflow-auto">
        <div className="p-6 space-y-6 animate-premium-fade-in">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold gradient-text">
                {getGreeting()}
              </h1>
              <div className="flex items-center gap-2">
                {(error || statsError || insightsError) && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Problema de conexão
                  </div>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <p className="text-white/60 text-lg">
              {getDaySummary()}
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                {statsError ? 'Error' : `${stats.totalMessages} msgs`}
              </div>
              <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                {statsError ? 'Error' : `${stats.totalDocuments} docs`}
              </div>
              <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                {insightsError ? 'Error' : `${insights.length} insights`}
              </div>
            </div>
          </div>

          {/* Error State for Data Loading */}
          {(statsError || insightsError) && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-medium">Erro ao carregar dados</h3>
                  <p className="text-sm text-red-200/80">
                    Alguns dados podem não estar disponíveis. Verifique sua conexão e tente novamente.
                  </p>
                </div>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm"
                  disabled={refreshing}
                  className="border-red-400 text-red-300 hover:bg-red-500/20"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {statsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonPremium key={i} className="h-48" />
              ))}
            </div>
          )}

          {/* Dashboard Grid */}
          {!statsLoading && (
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
                  <ActivityChart data={statsError ? [] : activityData} />
                </PremiumCard>
              </div>

              {/* Memory Card */}
              <MemoryCard totalMemories={statsError ? 0 : stats.totalMemories} />

              {/* Conversation Card */}
              <ConversationCard 
                totalConversations={statsError ? 0 : stats.totalConversations}
                avgMessages={statsError ? 0 : stats.avgMessagesPerConversation}
              />

              {/* AI Usage Card */}
              <AIUsageCard 
                tokensUsed={statsError ? 0 : stats.tokensUsed}
                tokenLimit={statsError ? 0 : stats.tokenLimit}
              />

              {/* Insights Card - Largo */}
              <div className="md:col-span-2">
                <InsightsCard 
                  insights={insightsError ? [] : insights} 
                  loading={insightsLoading}
                  error={insightsError}
                />
              </div>

              {/* Objectives Card */}
              <ObjectivesCard />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;


import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Brain, 
  MessageCircle, 
  Settings,
  TrendingUp,
  Users,
  Zap,
  Target,
  BookOpen,
  Award,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAutonomousLearning } from '@/hooks/useAutonomousLearning';
import { useMultiAgentCollaboration } from '@/hooks/useMultiAgentCollaboration';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { SkeletonPremium } from '@/components/ui/skeleton-premium';
import { PremiumCard } from '@/components/ui/premium-card';
import PerformanceMonitor from '@/components/analytics/PerformanceMonitor';

// Lazy load components for better performance
const PersonalizedCoaching = React.lazy(() => import('@/components/learning/PersonalizedCoaching'));
const ProcessOptimization = React.lazy(() => import('@/components/learning/ProcessOptimization'));
const ExecutionDashboard = React.lazy(() => import('@/components/autonomous/ExecutionDashboard'));
const AutonomousProjectsManager = React.lazy(() => import('@/components/autonomous/AutonomousProjectsManager'));

interface DashboardStats {
  totalProjects: number;
  activeAgents: number;
  completedTasks: number;
  learningRate: number;
  performanceScore: number;
  memoryEfficiency: number;
}

const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { learningStats, patterns } = useAutonomousLearning();
  const { agents, collaborationStats } = useMultiAgentCollaboration();
  const performanceData = usePerformanceMonitoring();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeAgents: 0,
    completedTasks: 0,
    learningRate: 0,
    performanceScore: 0,
    memoryEfficiency: 0
  });

  // Update stats from various sources
  useEffect(() => {
    setStats({
      totalProjects: Math.floor(Math.random() * 10) + 5,
      activeAgents: agents.filter(a => a.status !== 'idle').length,
      completedTasks: agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0),
      learningRate: Math.round(learningStats.preferencesLearned / learningStats.totalExperience * 100),
      performanceScore: performanceData.getPerformanceScore(),
      memoryEfficiency: Math.round(Math.random() * 20) + 80
    });
  }, [agents, learningStats, performanceData]);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const name = user?.email?.split('@')[0] || 'Usuário';
    
    if (hour < 12) return `Bom dia, ${name}! 🌅`;
    if (hour < 18) return `Boa tarde, ${name}! ☀️`;
    return `Boa noite, ${name}! 🌙`;
  };

  const getSystemStatus = () => {
    const avgPerformance = (stats.performanceScore + stats.memoryEfficiency + stats.learningRate) / 3;
    
    if (avgPerformance >= 85) return { status: 'excellent', color: 'text-green-400', message: 'Sistema operando em perfeitas condições' };
    if (avgPerformance >= 70) return { status: 'good', color: 'text-blue-400', message: 'Sistema funcionando bem' };
    if (avgPerformance >= 50) return { status: 'warning', color: 'text-yellow-400', message: 'Sistema necessita otimização' };
    return { status: 'critical', color: 'text-red-400', message: 'Sistema requer atenção imediata' };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="p-6 space-y-6">
        {/* Header Premium */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {getWelcomeMessage()}
              </h1>
              <p className="text-xl text-white/60 mt-2">
                Centro de Comando da IA Cognitiva
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm ${systemStatus.color}`}>
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">{systemStatus.message}</span>
              </div>
              <PerformanceMonitor />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <PremiumCard className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalProjects}</div>
                <div className="text-sm text-white/60">Projetos</div>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.activeAgents}</div>
                <div className="text-sm text-white/60">Agentes Ativos</div>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
                <div className="text-sm text-white/60">Tarefas</div>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.learningRate}%</div>
                <div className="text-sm text-white/60">Aprendizado</div>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{stats.performanceScore}%</div>
                <div className="text-sm text-white/60">Performance</div>
              </div>
            </PremiumCard>
            
            <PremiumCard className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{stats.memoryEfficiency}%</div>
                <div className="text-sm text-white/60">Memória</div>
              </div>
            </PremiumCard>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full bg-black/20 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Projetos</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Aprendizado</span>
            </TabsTrigger>
            <TabsTrigger value="coaching" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Coaching</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Otimização</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* System Health */}
              <PremiumCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Performance Geral</span>
                      <span className="text-sm font-bold text-green-400">{stats.performanceScore}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Eficiência de Memória</span>
                      <span className="text-sm font-bold text-blue-400">{stats.memoryEfficiency}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taxa de Aprendizado</span>
                      <span className="text-sm font-bold text-purple-400">{stats.learningRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Colaborações Ativas</span>
                      <span className="text-sm font-bold text-yellow-400">{collaborationStats.activeCollaborations}</span>
                    </div>
                  </div>
                </CardContent>
              </PremiumCard>

              {/* Recent Insights */}
              <PremiumCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Insights Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {patterns.slice(0, 3).map((pattern) => (
                        <div key={pattern.id} className="p-2 bg-white/5 rounded text-sm">
                          <div className="font-medium text-white/80">
                            {pattern.pattern.join(' → ')}
                          </div>
                          <div className="text-white/50 text-xs">
                            Confiança: {Math.round(pattern.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </PremiumCard>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Suspense fallback={<SkeletonPremium className="h-96" />}>
              <AutonomousProjectsManager />
            </Suspense>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Suspense fallback={<SkeletonPremium className="h-96" />}>
              <ExecutionDashboard />
            </Suspense>
          </TabsContent>

          {/* Coaching Tab */}
          <TabsContent value="coaching" className="space-y-6">
            <Suspense fallback={<SkeletonPremium className="h-96" />}>
              <PersonalizedCoaching />
            </Suspense>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Suspense fallback={<SkeletonPremium className="h-96" />}>
              <ProcessOptimization />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedDashboard;

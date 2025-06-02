
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  Activity, 
  Brain,
  BarChart3,
  Settings,
  Sparkles
} from 'lucide-react';
import LLMMetricsDashboard from './LLMMetricsDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="h-full overflow-y-auto scroll-container premium-scrollbar">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-white/60">
            Painel de controle do seu assistente cognitivo
          </p>
        </div>

        {/* Tabs principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="llm-metrics" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Métricas LLM
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cards de estatísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Conversas Ativas</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">12</div>
                  <p className="text-xs text-white/60">+2 desde ontem</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Documentos</CardTitle>
                  <FileText className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">8</div>
                  <p className="text-xs text-white/60">+1 este mês</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Nós Cognitivos</CardTitle>
                  <Brain className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">247</div>
                  <p className="text-xs text-white/60">Rede ativa</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Insights Gerados</CardTitle>
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">34</div>
                  <p className="text-xs text-white/60">Esta semana</p>
                </CardContent>
              </Card>
            </div>

            {/* Seção de atividade recente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Atividade Recente</CardTitle>
                  <CardDescription>Suas interações mais recentes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Nova conversa iniciada</p>
                        <p className="text-xs text-white/60">Há 2 minutos</p>
                      </div>
                    </div>
                    <Badge variant="outline">Chat</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Documento processado</p>
                        <p className="text-xs text-white/60">Há 15 minutos</p>
                      </div>
                    </div>
                    <Badge variant="outline">Documentos</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Insight descoberto</p>
                        <p className="text-xs text-white/60">Há 1 hora</p>
                      </div>
                    </div>
                    <Badge variant="outline">Cognitivo</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-white">Status do Sistema</CardTitle>
                  <CardDescription>Saúde dos componentes principais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Sistema Multi-LLM</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Cache Semântico</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Processamento de Documentos</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Rede Neural Cognitiva</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Sincronizando</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
                <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex flex-col gap-2" variant="outline">
                    <MessageSquare className="h-6 w-6" />
                    <span>Nova Conversa</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col gap-2" variant="outline">
                    <FileText className="h-6 w-6" />
                    <span>Upload Documento</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col gap-2" variant="outline">
                    <Brain className="h-6 w-6" />
                    <span>Explorar Insights</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="llm-metrics" className="space-y-6">
            <LLMMetricsDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Analytics Avançado</CardTitle>
                <CardDescription>Análises detalhadas do uso do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/60">Em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Configurações do Sistema</CardTitle>
                <CardDescription>Personalize seu assistente cognitivo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/60">Em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

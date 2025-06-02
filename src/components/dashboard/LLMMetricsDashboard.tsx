
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLLMMetrics } from '@/hooks/useLLMMetrics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  DollarSign, 
  Clock, 
  Zap, 
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const LLMMetricsDashboard = () => {
  const { 
    metrics, 
    fallbackMetrics, 
    costMetrics, 
    loading, 
    error, 
    refreshAllMetrics 
  } = useLLMMetrics();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(value);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Preparar dados para gráficos
  const modelPerformanceData = metrics.map(metric => ({
    name: metric.modelName,
    successRate: metric.successRate * 100,
    avgResponseTime: metric.avgResponseTime,
    totalCalls: metric.totalCalls,
    cost: metric.totalCost
  }));

  const costByModelData = metrics.map(metric => ({
    name: metric.modelName,
    value: metric.totalCost
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar métricas: {error}</p>
            <Button onClick={refreshAllMetrics} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Métricas LLM</h2>
          <p className="text-white/60">Análise detalhada do sistema multi-LLM</p>
        </div>
        <Button onClick={refreshAllMetrics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chamadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.reduce((sum, m) => sum + m.totalCalls, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.reduce((sum, m) => sum + m.totalCost, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(
                metrics.reduce((sum, m) => sum + m.avgResponseTime * m.totalCalls, 0) /
                metrics.reduce((sum, m) => sum + m.totalCalls, 0) || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Fallback</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(fallbackMetrics?.totalFallbacks || 0 / metrics.reduce((sum, m) => sum + m.totalCalls, 0) || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="fallbacks">Fallbacks</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Modelo</CardTitle>
              <CardDescription>Taxa de sucesso e tempo de resposta médio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="successRate" fill="#8884d8" name="Taxa de Sucesso (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tempo de Resposta</CardTitle>
              <CardDescription>Tempo médio de resposta por modelo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={modelPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatTime(value as number)} />
                  <Line type="monotone" dataKey="avgResponseTime" stroke="#82ca9d" name="Tempo Médio" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Custos por Modelo</CardTitle>
              <CardDescription>Custo total por modelo LLM</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costByModelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costByModelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fallbacks" className="space-y-4">
          {fallbackMetrics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Fallback</CardTitle>
                  <CardDescription>Análise detalhada dos fallbacks do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Total de Fallbacks</h4>
                      <p className="text-2xl font-bold text-orange-500">
                        {fallbackMetrics.totalFallbacks}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Impacto no Tempo de Resposta</h4>
                      <p className="text-sm text-muted-foreground">
                        Com fallback: {formatTime(fallbackMetrics.avgResponseTimeWithFallback)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sem fallback: {formatTime(fallbackMetrics.avgResponseTimeWithoutFallback)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Razões de Fallback</CardTitle>
                  <CardDescription>Distribuição das causas de fallback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(fallbackMetrics.fallbacksByReason).map(([reason, count]) => (
                      <div key={reason} className="flex items-center justify-between">
                        <span className="capitalize">{reason.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {metrics.map((metric) => (
              <Card key={metric.modelName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {metric.modelName}
                    <Badge variant="outline">{metric.provider}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Chamadas</p>
                      <p className="font-semibold">{metric.totalCalls}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa de Sucesso</p>
                      <p className="font-semibold">{formatPercentage(metric.successRate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tempo Médio</p>
                      <p className="font-semibold">{formatTime(metric.avgResponseTime)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custo Total</p>
                      <p className="font-semibold">{formatCurrency(metric.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa de Cache</p>
                      <p className="font-semibold">{formatPercentage(metric.cacheHitRate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa de Fallback</p>
                      <p className="font-semibold">{formatPercentage(metric.fallbackRate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens Usados</p>
                      <p className="font-semibold">{metric.totalTokensUsed.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P95 Tempo</p>
                      <p className="font-semibold">{formatTime(metric.p95ResponseTime)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMMetricsDashboard;

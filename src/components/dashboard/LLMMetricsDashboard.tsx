
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
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const LLMMetricsDashboard = () => {
  const { 
    metrics, 
    fallbackMetrics, 
    costMetrics, 
    isLoading, 
    error, 
    refreshAllMetrics 
  } = useLLMMetrics();

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
    name: metric.model_name,
    successRate: metric.success_rate * 100,
    avgResponseTime: metric.response_time,
    totalCalls: metric.total_calls,
    cost: metric.estimated_cost
  }));

  const costByModelData = metrics.map(metric => ({
    name: metric.model_name,
    value: metric.estimated_cost
  }));

  if (isLoading) {
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
            <p>Erro ao carregar métricas: {error.message || 'Erro desconhecido'}</p>
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
              {metrics.reduce((sum, m) => sum + m.total_calls, 0)}
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
              {formatCurrency(metrics.reduce((sum, m) => sum + m.estimated_cost, 0))}
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
                metrics.reduce((sum, m) => sum + m.response_time * m.total_calls, 0) /
                metrics.reduce((sum, m) => sum + m.total_calls, 0) || 0
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
              {formatPercentage((fallbackMetrics?.totalFallbacks || 0) / (metrics.reduce((sum, m) => sum + m.total_calls, 0) || 1))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {modelPerformanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance por Modelo</CardTitle>
            <CardDescription>Taxa de sucesso por modelo LLM</CardDescription>
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
      )}

      {/* Models List */}
      <div className="grid gap-4">
        {metrics.map((metric) => (
          <Card key={metric.model_name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {metric.model_name}
                <Badge variant="outline">{metric.provider}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Chamadas</p>
                  <p className="font-semibold">{metric.total_calls}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa de Sucesso</p>
                  <p className="font-semibold">{formatPercentage(metric.success_rate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tempo Médio</p>
                  <p className="font-semibold">{formatTime(metric.response_time)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Custo Total</p>
                  <p className="font-semibold">{formatCurrency(metric.estimated_cost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LLMMetricsDashboard;

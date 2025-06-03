
/**
 * @description Dashboard para monitoramento do sistema multi-LLM
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import React, { useState } from 'react';
import { useMultiLLMRouter } from '@/hooks/useMultiLLMRouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Activity,
  Shield,
  Target,
  Shuffle
} from 'lucide-react';
import type { TaskType, Priority } from '@/services/MultiLLMRouter';

export function MultiLLMDashboard() {
  const { 
    isProcessing,
    lastResponse,
    providerStats,
    healthStatus,
    processRequest,
    processInQueue,
    updateProviderStatus,
    refreshStats
  } = useMultiLLMRouter();

  const [testPrompt, setTestPrompt] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>('general');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');

  const handleTestRequest = async () => {
    if (!testPrompt.trim()) return;

    await processRequest(testPrompt, {
      taskType: selectedTaskType,
      priority: selectedPriority
    });
  };

  const handleQueueRequest = async () => {
    if (!testPrompt.trim()) return;

    await processInQueue(testPrompt, {
      taskType: selectedTaskType,
      priority: selectedPriority
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'down': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const renderProviderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providerStats.map((provider) => (
        <Card key={provider.id} className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              <Badge variant={provider.isAvailable ? "default" : "secondary"}>
                {provider.isAvailable ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Confiabilidade
              </span>
              <span className="font-medium">{(provider.reliability * 100).toFixed(1)}%</span>
            </div>
            <Progress value={provider.reliability * 100} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tempo Resposta
              </span>
              <span className="font-medium">{provider.responseTime}ms</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Custo/Token
              </span>
              <span className="font-medium">${provider.costPerToken.toFixed(6)}</span>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium">Capacidades:</span>
              <div className="flex flex-wrap gap-1">
                {provider.capabilities.map((cap) => (
                  <Badge key={cap} variant="outline" className="text-xs">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateProviderStatus(provider.id, !provider.isAvailable)}
              >
                {provider.isAvailable ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderHealthStatus = () => (
    <div className="space-y-4">
      {healthStatus.map((health) => (
        <Card key={health.id} className="border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={getStatusColor(health.status)}>
                  {getStatusIcon(health.status)}
                </div>
                <div>
                  <h4 className="font-medium">{health.id}</h4>
                  <p className="text-sm text-gray-500">
                    Última verificação: {health.lastCheck.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {health.responseTime < 1000 ? `${health.responseTime}ms` : 'Timeout'}
                </div>
                <div className="text-xs text-gray-500">
                  {(health.successRate * 100).toFixed(1)}% sucesso
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTestInterface = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interface de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo de Tarefa</label>
            <Select value={selectedTaskType} onValueChange={(value: TaskType) => setSelectedTaskType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="coding">Código</SelectItem>
                <SelectItem value="analysis">Análise</SelectItem>
                <SelectItem value="creative">Criativo</SelectItem>
                <SelectItem value="technical">Técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Prioridade</label>
            <Select value={selectedPriority} onValueChange={(value: Priority) => setSelectedPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Prompt de Teste</label>
            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Digite seu prompt para testar o roteamento multi-LLM..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTestRequest}
              disabled={!testPrompt.trim() || isProcessing}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Teste Direto
            </Button>
            <Button 
              onClick={handleQueueRequest}
              disabled={!testPrompt.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Teste com Fila
            </Button>
            <Button 
              onClick={refreshStats}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Última Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Provider: {lastResponse.provider}</span>
                <div className="flex items-center gap-2">
                  {lastResponse.fallbackUsed && (
                    <Badge variant="outline" className="text-yellow-600">
                      Fallback
                    </Badge>
                  )}
                  <Badge variant="default">
                    {lastResponse.confidence.toFixed(2)} confiança
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {lastResponse.content}
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tokens:</span>
                  <div className="font-medium">{lastResponse.tokensUsed}</div>
                </div>
                <div>
                  <span className="text-gray-500">Tempo:</span>
                  <div className="font-medium">{lastResponse.responseTime}ms</div>
                </div>
                <div>
                  <span className="text-gray-500">Custo:</span>
                  <div className="font-medium">${lastResponse.cost.toFixed(6)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Modelo:</span>
                  <div className="font-medium">{lastResponse.model}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Sistema Multi-LLM Resiliente</h2>
          <p className="text-gray-600">
            Roteamento inteligente com failover automático entre provedores
          </p>
        </div>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Provedores</TabsTrigger>
          <TabsTrigger value="health">Saúde</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="providers" className="mt-6">
          {renderProviderStats()}
        </TabsContent>
        
        <TabsContent value="health" className="mt-6">
          {renderHealthStatus()}
        </TabsContent>
        
        <TabsContent value="test" className="mt-6">
          {renderTestInterface()}
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics em Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Métricas avançadas e relatórios de uso serão implementados na próxima fase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MultiLLMDashboard;

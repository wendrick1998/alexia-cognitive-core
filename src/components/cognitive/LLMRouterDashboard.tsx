
import React, { useState } from 'react';
import { useLLMRouter, type TaskType } from '@/hooks/useLLMRouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Code, Lightbulb, TrendingUp, Clock, DollarSign, Target } from 'lucide-react';

const LLMRouterDashboard: React.FC = () => {
  const { 
    selectedModel,
    isLoading,
    lastUsedModel,
    routeToOptimalLLM,
    getModelStats,
    detectTaskType,
    selectBestModel,
    availableModels
  } = useLLMRouter();

  const [testInput, setTestInput] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('general');
  const [isProcessing, setIsProcessing] = useState(false);
  const [routingResult, setRoutingResult] = useState<any>(null);

  // Testar roteamento
  const handleTestRouting = async () => {
    if (!testInput.trim()) return;

    setIsProcessing(true);
    try {
      const result = await routeToOptimalLLM(testInput);
      setRoutingResult(result);
      console.log('🎯 Resultado do roteamento:', result);
    } catch (error) {
      console.error('❌ Erro no teste de roteamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Detectar tipo automaticamente
  const handleDetectTaskType = () => {
    if (!testInput.trim()) return;
    
    const detectedType = detectTaskType(testInput);
    setTaskType(detectedType);
  };

  // Obter melhor modelo para tarefa
  const handleSelectBestModel = () => {
    const bestModel = selectBestModel(taskType);
    console.log(`🎯 Melhor modelo para ${taskType}:`, bestModel);
  };

  const renderModelStats = () => {
    const stats = getModelStats();
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((model) => (
          <Card key={model.id} className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <Badge variant="default">
                  {model.provider}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Custo por Token
                  </span>
                  <span className="font-medium">${model.costPerToken.toFixed(6)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    Capacidades
                  </span>
                  <span className="font-medium">{model.capabilities}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Max Tokens
                  </span>
                  <span className="font-medium">{model.maxTokens.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRoutingTest = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo de Tarefa</label>
            <Select 
              value={taskType} 
              onValueChange={(value: TaskType) => setTaskType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="question_answering">Perguntas e Respostas</SelectItem>
                <SelectItem value="code_generation">Geração de Código</SelectItem>
                <SelectItem value="creative_writing">Escrita Criativa</SelectItem>
                <SelectItem value="analysis">Análise</SelectItem>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="research">Pesquisa</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="document_analysis">Análise de Documentos</SelectItem>
                <SelectItem value="memory_retrieval">Recuperação de Memória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Input de Teste</label>
            <Textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite sua pergunta ou tarefa para testar o roteamento..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleDetectTaskType}
              variant="outline"
              disabled={!testInput.trim()}
            >
              <Target className="w-4 h-4 mr-2" />
              Detectar Tipo
            </Button>
            <Button 
              onClick={handleSelectBestModel}
              variant="outline"
              disabled={!taskType}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Melhor Modelo
            </Button>
            <Button 
              onClick={handleTestRouting}
              disabled={!testInput.trim() || isProcessing}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Testar Roteamento
            </Button>
          </div>
        </CardContent>
      </Card>

      {routingResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Roteamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded border border-green-500 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Modelo Selecionado: {routingResult.model}</span>
                  <Badge variant="default">
                    {routingResult.provider}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Tipo de Tarefa: {routingResult.taskType}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCurrentStatus = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Modelo Selecionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{selectedModel}</div>
          <div className="text-sm text-gray-500">Atualmente ativo</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Último Modelo Usado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{lastUsedModel || 'Nenhum'}</div>
          <div className="text-sm text-gray-500">Sessão anterior</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Processando...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Pronto</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAvailableModels = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Modelos Disponíveis</h3>
      <div className="grid grid-cols-1 gap-2">
        {availableModels.map((model) => (
          <Card key={model} className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{model}</span>
              <Badge variant="outline">Ativo</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">LLM Router Inteligente</h2>
          <p className="text-gray-600">
            Sistema de roteamento multi-modelo com otimização automática
          </p>
        </div>
      </div>

      {renderCurrentStatus()}

      <Tabs defaultValue="routing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routing">Roteamento</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="routing" className="mt-6">
          {renderRoutingTest()}
        </TabsContent>
        
        <TabsContent value="models" className="mt-6">
          {renderAvailableModels()}
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          {renderModelStats()}
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          {renderAvailableModels()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMRouterDashboard;

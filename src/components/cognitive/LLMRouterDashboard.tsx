
import React, { useState, useEffect } from 'react';
import { useLLMRouter } from '@/hooks/useLLMRouter';
import { usePromptEngine } from '@/hooks/usePromptEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Code, Lightbulb, TrendingUp, Clock, DollarSign, Target } from 'lucide-react';

const LLMRouterDashboard: React.FC = () => {
  const { 
    state, 
    capabilities, 
    routeToOptimalLLM, 
    executeWithModel, 
    executeParallel 
  } = useLLMRouter();
  
  const { 
    generatePrompt, 
    enhancePrompt, 
    templates, 
    estimateTokens 
  } = usePromptEngine();

  const [testInput, setTestInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('chain-of-thought');
  const [preferences, setPreferences] = useState({
    prioritizeSpeed: 30,
    prioritizeQuality: 50,
    prioritizeCost: 20,
    taskType: 'general' as const
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Testar roteamento
  const handleTestRouting = async () => {
    if (!testInput.trim()) return;

    setIsProcessing(true);
    try {
      const routing = await routeToOptimalLLM(
        testInput,
        {
          prioritizeSpeed: preferences.prioritizeSpeed / 100,
          prioritizeQuality: preferences.prioritizeQuality / 100,
          prioritizeCost: preferences.prioritizeCost / 100,
          taskType: preferences.taskType
        },
        0.5 // complexidade default
      );

      console.log('🎯 Resultado do roteamento:', routing);
    } catch (error) {
      console.error('❌ Erro no teste de roteamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Testar execução paralela
  const handleTestParallel = async () => {
    if (!testInput.trim()) return;

    setIsProcessing(true);
    try {
      const results = await executeParallel(testInput, undefined, 2);
      setTestResults(prev => [...prev, {
        id: Date.now(),
        input: testInput,
        results,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('❌ Erro na execução paralela:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Gerar prompt avançado
  const handleGeneratePrompt = () => {
    if (!testInput.trim()) return;

    const enhanced = generatePrompt(selectedTemplate, {
      task: testInput,
      context: 'Dashboard de teste',
      complexity: '0.5'
    });

    const finalPrompt = enhancePrompt(enhanced, {
      addChainOfThought: true,
      addSelfConsistency: true
    });

    setTestInput(finalPrompt);
  };

  const renderCapabilityMatrix = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.values(capabilities).map((model) => (
        <Card key={model.name} className={`border ${model.available ? 'border-green-200' : 'border-gray-200'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{model.name}</CardTitle>
              <Badge variant={model.available ? "default" : "secondary"}>
                {model.available ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  Raciocínio
                </span>
                <span className="font-medium">{(model.reasoning * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  Criatividade
                </span>
                <span className="font-medium">{(model.creativity * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Code className="w-4 h-4" />
                  Código
                </span>
                <span className="font-medium">{(model.code * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Velocidade
                </span>
                <span className="font-medium">{(model.speed * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Custo-benefício
                </span>
                <span className="font-medium">{(model.cost * 100).toFixed(0)}%</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {model.strengths.map((strength) => (
                  <Badge key={strength} variant="outline" className="text-xs">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderRoutingTest = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Roteamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo de Tarefa</label>
            <Select 
              value={preferences.taskType} 
              onValueChange={(value: any) => setPreferences(prev => ({ ...prev, taskType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="reasoning">Raciocínio</SelectItem>
                <SelectItem value="creative">Criativo</SelectItem>
                <SelectItem value="coding">Código</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Priorizar Velocidade: {preferences.prioritizeSpeed}%
            </label>
            <Slider
              value={[preferences.prioritizeSpeed]}
              onValueChange={([value]) => setPreferences(prev => ({ ...prev, prioritizeSpeed: value }))}
              max={100}
              step={10}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Priorizar Qualidade: {preferences.prioritizeQuality}%
            </label>
            <Slider
              value={[preferences.prioritizeQuality]}
              onValueChange={([value]) => setPreferences(prev => ({ ...prev, prioritizeQuality: value }))}
              max={100}
              step={10}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Priorizar Custo: {preferences.prioritizeCost}%
            </label>
            <Slider
              value={[preferences.prioritizeCost]}
              onValueChange={([value]) => setPreferences(prev => ({ ...prev, prioritizeCost: value }))}
              max={100}
              step={10}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Template de Prompt</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(templates).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
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
            {testInput && (
              <p className="text-xs text-gray-500 mt-1">
                Tokens estimados: {estimateTokens(testInput)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGeneratePrompt}
              variant="outline"
              disabled={!testInput.trim()}
            >
              <Target className="w-4 h-4 mr-2" />
              Gerar Prompt
            </Button>
            <Button 
              onClick={handleTestRouting}
              disabled={!testInput.trim() || isProcessing}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Testar Roteamento
            </Button>
            <Button 
              onClick={handleTestParallel}
              disabled={!testInput.trim() || isProcessing}
              variant="outline"
            >
              <Zap className="w-4 h-4 mr-2" />
              Execução Paralela
            </Button>
          </div>
        </CardContent>
      </Card>

      {state.routing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Roteamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.routing.map((route, index) => (
                <div 
                  key={route.model} 
                  className={`p-3 rounded border ${index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{route.model}</span>
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      Score: {route.score.toFixed(3)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{route.reasoning}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Qualidade: {(route.estimatedQuality * 100).toFixed(0)}%</span>
                    <span>Velocidade: {(route.estimatedSpeed * 100).toFixed(0)}%</span>
                    <span>Custo: {(route.estimatedCost * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(state.performance).map(([model, metrics]) => (
        <Card key={model}>
          <CardHeader>
            <CardTitle className="text-lg">{model}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Sucesso
                </span>
                <span className="font-medium">{(metrics.successRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Latência Média
                </span>
                <span className="font-medium">{metrics.avgLatency.toFixed(0)}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTestResults = () => (
    <div className="space-y-4">
      {testResults.map((test) => (
        <Card key={test.id}>
          <CardHeader>
            <CardTitle className="text-sm">
              Teste - {test.timestamp.toLocaleTimeString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Input:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {test.input.substring(0, 200)}...
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Resultado Principal:</p>
                <Badge variant="default">{test.results.primary.model}</Badge>
                <p className="text-sm text-gray-600 mt-1">
                  Latência: {test.results.primary.latency}ms | 
                  Qualidade: {(test.results.primary.quality * 100).toFixed(0)}%
                </p>
              </div>
              {test.results.alternatives.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Alternativas:</p>
                  <div className="flex gap-2">
                    {test.results.alternatives.map((alt: any, i: number) => (
                      <Badge key={i} variant="outline">{alt.model}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
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

      {state.selectedModel && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Modelo Ativo:</span>
              <div className="flex items-center gap-2">
                <Badge variant="default">{state.selectedModel}</Badge>
                <span className="text-sm text-gray-600">
                  Confiança: {(state.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="routing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routing">Roteamento</TabsTrigger>
          <TabsTrigger value="capabilities">Modelos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="routing" className="mt-6">
          {renderRoutingTest()}
        </TabsContent>
        
        <TabsContent value="capabilities" className="mt-6">
          {renderCapabilityMatrix()}
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          {renderPerformanceMetrics()}
        </TabsContent>
        
        <TabsContent value="results" className="mt-6">
          {renderTestResults()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMRouterDashboard;

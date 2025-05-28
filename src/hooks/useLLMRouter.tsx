
import { useCallback, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface LLMCapability {
  name: string;
  reasoning: number;
  creativity: number;
  code: number;
  speed: number;
  cost: number;
  context: number;
  available: boolean;
  strengths: string[];
}

export interface ModelScore {
  model: string;
  score: number;
  reasoning: string;
  estimatedQuality: number;
  estimatedSpeed: number;
  estimatedCost: number;
}

export interface RoutingPreferences {
  prioritizeSpeed: number; // 0-1
  prioritizeQuality: number; // 0-1
  prioritizeCost: number; // 0-1
  taskType: 'reasoning' | 'creative' | 'coding' | 'general';
}

export interface LLMRouterState {
  selectedModel: string | null;
  confidence: number;
  routing: ModelScore[];
  performance: Record<string, { successRate: number; avgLatency: number }>;
  abTestResults: Record<string, number>;
}

export function useLLMRouter() {
  const { user } = useAuth();
  const [state, setState] = useState<LLMRouterState>({
    selectedModel: null,
    confidence: 0,
    routing: [],
    performance: {},
    abTestResults: {}
  });

  // Capability matrix atualizada dinamicamente
  const capabilities = useRef<Record<string, LLMCapability>>({
    'gpt-4o': {
      name: 'GPT-4o',
      reasoning: 0.95,
      creativity: 0.85,
      code: 0.80,
      speed: 0.70,
      cost: 0.30,
      context: 128000,
      available: true,
      strengths: ['reasoning', 'analysis', 'general-purpose', 'vision']
    },
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      reasoning: 0.75,
      creativity: 0.70,
      code: 0.85,
      speed: 0.95,
      cost: 0.90,
      context: 128000,
      available: true,
      strengths: ['speed', 'cost-effective', 'coding', 'general-purpose']
    },
    'claude-3-opus': {
      name: 'Claude 3 Opus',
      reasoning: 0.90,
      creativity: 0.90,
      code: 0.85,
      speed: 0.60,
      cost: 0.40,
      context: 200000,
      available: false, // Seria configurado dinamicamente
      strengths: ['creativity', 'reasoning', 'long-context', 'safety']
    },
    'deepseek-coder': {
      name: 'DeepSeek Coder',
      reasoning: 0.70,
      creativity: 0.60,
      code: 0.95,
      speed: 0.85,
      cost: 0.85,
      context: 64000,
      available: false, // Seria configurado dinamicamente
      strengths: ['coding', 'technical', 'debugging', 'architecture']
    }
  });

  // Multi-objective optimization usando Pareto frontier
  const calculateParetoScore = useCallback((
    model: LLMCapability,
    preferences: RoutingPreferences,
    taskComplexity: number
  ): number => {
    let score = 0;

    // Base capability score baseado no tipo de tarefa
    switch (preferences.taskType) {
      case 'reasoning':
        score += model.reasoning * 0.4;
        break;
      case 'creative':
        score += model.creativity * 0.4;
        break;
      case 'coding':
        score += model.code * 0.4;
        break;
      default:
        score += (model.reasoning + model.creativity + model.code) / 3 * 0.4;
    }

    // Weighted preferences
    score += model.speed * preferences.prioritizeSpeed * 0.2;
    score += model.reasoning * preferences.prioritizeQuality * 0.2;
    score += model.cost * preferences.prioritizeCost * 0.2;

    // Task complexity adjustment
    if (taskComplexity > 0.7 && model.reasoning > 0.8) {
      score += 0.1; // Bonus para modelos de alta qualidade em tarefas complexas
    } else if (taskComplexity < 0.3 && model.speed > 0.8) {
      score += 0.1; // Bonus para modelos rápidos em tarefas simples
    }

    // Context window consideration
    if (taskComplexity > 0.5 && model.context > 100000) {
      score += 0.05;
    }

    // Historical performance adjustment
    const performance = state.performance[model.name];
    if (performance) {
      score *= performance.successRate; // Penaliza modelos com baixa taxa de sucesso
      if (performance.avgLatency < 2000) score += 0.05; // Bonus para baixa latência
    }

    return Math.min(1.0, score);
  }, [state.performance]);

  // Route para modelo ótimo
  const routeToOptimalLLM = useCallback(async (
    input: string,
    preferences: RoutingPreferences = {
      prioritizeSpeed: 0.3,
      prioritizeQuality: 0.5,
      prioritizeCost: 0.2,
      taskType: 'general'
    },
    taskComplexity: number = 0.5
  ) => {
    console.log('🧠 Iniciando roteamento LLM inteligente...');

    try {
      // Calcular scores para todos os modelos disponíveis
      const modelScores: ModelScore[] = Object.values(capabilities.current)
        .filter(model => model.available)
        .map(model => {
          const score = calculateParetoScore(model, preferences, taskComplexity);
          return {
            model: model.name,
            score,
            reasoning: `Selecionado por: ${model.strengths.join(', ')}`,
            estimatedQuality: model.reasoning,
            estimatedSpeed: model.speed,
            estimatedCost: model.cost
          };
        })
        .sort((a, b) => b.score - a.score);

      if (modelScores.length === 0) {
        throw new Error('Nenhum modelo disponível');
      }

      const selectedModel = modelScores[0];
      
      // A/B testing automático (10% das requisições)
      if (Math.random() < 0.1 && modelScores.length > 1) {
        const alternativeModel = modelScores[1];
        console.log(`🧪 A/B Test: Testando ${alternativeModel.model} vs ${selectedModel.model}`);
        
        // Usar modelo alternativo para teste
        setState(prev => ({
          ...prev,
          selectedModel: alternativeModel.model,
          confidence: alternativeModel.score,
          routing: modelScores
        }));

        return {
          selectedModel: alternativeModel.model,
          confidence: alternativeModel.score,
          routing: modelScores,
          isABTest: true
        };
      }

      console.log(`🎯 Modelo selecionado: ${selectedModel.model} (Score: ${selectedModel.score.toFixed(3)})`);

      setState(prev => ({
        ...prev,
        selectedModel: selectedModel.model,
        confidence: selectedModel.score,
        routing: modelScores
      }));

      return {
        selectedModel: selectedModel.model,
        confidence: selectedModel.score,
        routing: modelScores,
        isABTest: false
      };

    } catch (error) {
      console.error('❌ Erro no roteamento LLM:', error);
      
      // Fallback para GPT-4o-mini
      const fallback = {
        selectedModel: 'gpt-4o-mini',
        confidence: 0.5,
        routing: [],
        isABTest: false
      };

      setState(prev => ({
        ...prev,
        selectedModel: fallback.selectedModel,
        confidence: fallback.confidence,
        routing: []
      }));

      return fallback;
    }
  }, [calculateParetoScore]);

  // Executar com modelo selecionado
  const executeWithModel = useCallback(async (
    input: string,
    model: string,
    systemPrompt?: string
  ) => {
    const startTime = Date.now();
    
    try {
      console.log(`🤖 Executando com ${model}...`);

      const { data, error } = await supabase.functions.invoke('intelligent-llm-execution', {
        body: {
          input,
          model,
          systemPrompt,
          userId: user?.id
        }
      });

      if (error) throw error;

      const latency = Date.now() - startTime;

      // Atualizar métricas de performance
      setState(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          [model]: {
            successRate: (prev.performance[model]?.successRate || 0.9) * 0.9 + 0.1,
            avgLatency: (prev.performance[model]?.avgLatency || latency) * 0.7 + latency * 0.3
          }
        }
      }));

      return {
        success: true,
        result: data.result,
        model,
        latency,
        quality: data.quality || 0.8
      };

    } catch (error) {
      console.error(`❌ Erro na execução com ${model}:`, error);
      
      // Atualizar métricas de falha
      setState(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          [model]: {
            successRate: (prev.performance[model]?.successRate || 0.9) * 0.9,
            avgLatency: prev.performance[model]?.avgLatency || 5000
          }
        }
      }));

      throw error;
    }
  }, [user]);

  // Parallel execution com múltiplos modelos
  const executeParallel = useCallback(async (
    input: string,
    systemPrompt?: string,
    maxModels: number = 2
  ) => {
    console.log('🚀 Iniciando execução paralela...');

    const routing = await routeToOptimalLLM(input);
    const topModels = routing.routing
      .slice(0, maxModels)
      .map(r => r.model);

    if (topModels.length === 0) {
      throw new Error('Nenhum modelo disponível para execução paralela');
    }

    // Executar em paralelo
    const executions = topModels.map(model => 
      executeWithModel(input, model, systemPrompt)
        .catch(error => ({ success: false, error: error.message, model }))
    );

    const results = await Promise.allSettled(executions);
    
    // Filtrar resultados bem-sucedidos
    const successfulResults = results
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(result => result && result.success);

    if (successfulResults.length === 0) {
      throw new Error('Todas as execuções falharam');
    }

    // Weighted voting para síntese
    const weightedResult = synthesizeResults(successfulResults);

    return {
      primary: successfulResults[0],
      alternatives: successfulResults.slice(1),
      synthesized: weightedResult,
      totalModels: topModels.length,
      successRate: successfulResults.length / topModels.length
    };
  }, [routeToOptimalLLM, executeWithModel]);

  // Síntese de resultados usando weighted voting
  const synthesizeResults = useCallback((results: any[]) => {
    if (results.length === 1) return results[0];

    // Calcular pesos baseados em qualidade e latência
    const weights = results.map(result => {
      const qualityWeight = result.quality || 0.8;
      const speedWeight = Math.max(0.1, 1 - (result.latency / 10000)); // Normalizar latência
      return qualityWeight * 0.7 + speedWeight * 0.3;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);

    // Para agora, retornamos o resultado com maior peso
    // Em implementação futura, podemos fazer síntese real do conteúdo
    const bestIndex = normalizedWeights.indexOf(Math.max(...normalizedWeights));
    
    return {
      ...results[bestIndex],
      isSynthesized: true,
      sourceModels: results.map(r => r.model),
      confidence: Math.max(...normalizedWeights)
    };
  }, []);

  // Atualizar capability matrix dinamicamente
  const updateCapabilities = useCallback((modelName: string, updates: Partial<LLMCapability>) => {
    capabilities.current[modelName] = {
      ...capabilities.current[modelName],
      ...updates
    };
  }, []);

  return {
    // Estado
    state,
    capabilities: capabilities.current,
    
    // Roteamento
    routeToOptimalLLM,
    executeWithModel,
    executeParallel,
    
    // Utilitários
    updateCapabilities,
    synthesizeResults
  };
}

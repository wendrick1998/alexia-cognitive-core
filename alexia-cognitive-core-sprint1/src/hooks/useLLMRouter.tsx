/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Integração do sistema de feedback ativo com o hook de roteamento multi-LLM
 * Atualiza o hook useLLMRouter para considerar preferências baseadas em feedback
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Tipos de modelos suportados
export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | 'groq';
export type ModelTier = 'basic' | 'standard' | 'advanced' | 'expert';

// Tipos de tarefas para roteamento inteligente
export type TaskType = 
  | 'general'
  | 'creative'
  | 'code'
  | 'reasoning'
  | 'academic'
  | 'summarization'
  | 'extraction';

// Configuração de modelos
interface ModelConfig {
  provider: LLMProvider;
  modelName: string;
  tier: ModelTier;
  contextWindow: number;
  costPer1kTokens: number;
  strengths: string[];
  apiEndpoint: string;
  timeout: number;
  enabled: boolean;
}

// Preferências do usuário baseadas em feedback
interface UserPreference {
  taskType: TaskType;
  preferredModel: string;
  confidenceScore: number;
}

// Mapeamento de modelos disponíveis
const availableModels: Record<string, ModelConfig> = {
  'gpt-4o-mini': {
    provider: 'openai',
    modelName: 'gpt-4o-mini',
    tier: 'standard',
    contextWindow: 128000,
    costPer1kTokens: 0.15,
    strengths: ['general', 'instruction-following', 'reasoning'],
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    timeout: 30000,
    enabled: true
  },
  'claude-3-opus': {
    provider: 'anthropic',
    modelName: 'claude-3-opus',
    tier: 'expert',
    contextWindow: 200000,
    costPer1kTokens: 0.75,
    strengths: ['reasoning', 'instruction-following', 'creative', 'academic'],
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    timeout: 60000,
    enabled: true
  },
  'deepseek-coder': {
    provider: 'deepseek',
    modelName: 'deepseek-coder',
    tier: 'advanced',
    contextWindow: 32000,
    costPer1kTokens: 0.20,
    strengths: ['code', 'technical', 'documentation'],
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    timeout: 45000,
    enabled: true
  },
  'groq-mixtral': {
    provider: 'groq',
    modelName: 'mixtral-8x7b',
    tier: 'standard',
    contextWindow: 32000,
    costPer1kTokens: 0.10,
    strengths: ['speed', 'general', 'multilingual'],
    apiEndpoint: 'https://api.groq.com/v1/chat/completions',
    timeout: 15000,
    enabled: true
  }
};

// Interface para uso do hook
interface UseLLMRouterOptions {
  defaultProvider?: LLMProvider;
  enableAutoRouting?: boolean;
  costLimit?: number;
  userPreferences?: {
    preferredProvider?: LLMProvider;
    preferSpeed?: boolean;
    preferAccuracy?: boolean;
  };
  userId?: string; // Adicionado para carregar preferências baseadas em feedback
}

// Interface para resultados do hook
interface LLMRouterResult {
  currentProvider: LLMProvider;
  currentModel: string;
  availableProviders: LLMProvider[];
  setProvider: (provider: LLMProvider) => void;
  routeByTask: (task: TaskType) => ModelConfig;
  isProviderEnabled: (provider: LLMProvider) => boolean;
  toggleProvider: (provider: LLMProvider, enabled: boolean) => void;
  modelStats: Record<string, {
    totalCalls: number;
    avgResponseTime: number;
    failureRate: number;
    costToDate: number;
  }>;
  // Novos métodos para feedback
  recordResponseContext: (context: {
    question: string;
    answer: string;
    modelName: string;
    provider: string;
    usedFallback: boolean;
    responseTime: number;
    tokensUsed: number;
  }) => string; // Retorna sessionId para uso no componente de feedback
}

/**
 * Hook principal para roteamento de LLMs, atualizado para considerar feedback do usuário
 */
export const useLLMRouter = (options: UseLLMRouterOptions = {}): LLMRouterResult => {
  const {
    defaultProvider = 'openai',
    enableAutoRouting = true,
    costLimit = Infinity,
    userPreferences = {},
    userId = 'anonymous'
  } = options;

  // Estado para o provedor atual
  const [currentProvider, setCurrentProvider] = useState<LLMProvider>(
    userPreferences.preferredProvider || defaultProvider
  );
  
  // Estado para estatísticas de uso dos modelos
  const [modelStats, setModelStats] = useState<Record<string, {
    totalCalls: number;
    avgResponseTime: number;
    failureRate: number;
    costToDate: number;
  }>>({});
  
  // Estado para preferências baseadas em feedback
  const [feedbackPreferences, setFeedbackPreferences] = useState<UserPreference[]>([]);
  
  // Estado para sessão atual
  const [sessionId] = useState<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  // Efeito para carregar estatísticas de uso do Supabase
  useEffect(() => {
    const loadModelStats = async () => {
      try {
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL as string,
          import.meta.env.VITE_SUPABASE_ANON_KEY as string
        );
        
        const { data, error } = await supabase
          .from('llm_usage_stats')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          const stats: Record<string, any> = {};
          data.forEach(item => {
            stats[item.model_name] = {
              totalCalls: item.total_calls,
              avgResponseTime: item.avg_response_time,
              failureRate: item.failure_rate,
              costToDate: item.cost_to_date
            };
          });
          
          setModelStats(stats);
        }
      } catch (error) {
        console.error('Failed to load model stats:', error);
      }
    };
    
    loadModelStats();
  }, []);
  
  // Efeito para carregar preferências baseadas em feedback
  useEffect(() => {
    const loadFeedbackPreferences = async () => {
      if (!userId || userId === 'anonymous') return;
      
      try {
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL as string,
          import.meta.env.VITE_SUPABASE_ANON_KEY as string
        );
        
        const { data, error } = await supabase
          .from('llm_orchestrator_preferences')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const preferences: UserPreference[] = data.map(item => ({
            taskType: item.task_type as TaskType,
            preferredModel: item.preferred_model,
            confidenceScore: item.confidence_score
          }));
          
          setFeedbackPreferences(preferences);
        }
      } catch (error) {
        console.error('Failed to load feedback preferences:', error);
      }
    };
    
    loadFeedbackPreferences();
  }, [userId]);

  // Função para verificar se um provedor está habilitado
  const isProviderEnabled = useCallback((provider: LLMProvider): boolean => {
    return Object.values(availableModels)
      .some(model => model.provider === provider && model.enabled);
  }, []);

  // Função para alternar habilitação de um provedor
  const toggleProvider = useCallback((provider: LLMProvider, enabled: boolean) => {
    // Atualiza o estado local dos modelos
    Object.keys(availableModels).forEach(key => {
      if (availableModels[key].provider === provider) {
        availableModels[key].enabled = enabled;
      }
    });
    
    // Se o provedor atual for desabilitado, muda para outro disponível
    if (!enabled && currentProvider === provider) {
      const nextAvailable = Object.values(availableModels)
        .find(model => model.enabled)?.provider || 'openai';
      
      setCurrentProvider(nextAvailable);
    }
  }, [currentProvider]);

  // Função para rotear por tipo de tarefa, considerando feedback do usuário
  const routeByTask = useCallback((task: TaskType): ModelConfig => {
    // Verificar se há uma preferência baseada em feedback para esta tarefa
    const preference = feedbackPreferences.find(p => p.taskType === task);
    
    // Se houver preferência com confiança alta, usar o modelo preferido
    if (preference && preference.confidenceScore > 0.7) {
      const preferredModel = availableModels[preference.preferredModel];
      if (preferredModel && preferredModel.enabled) {
        return preferredModel;
      }
    }
    
    if (!enableAutoRouting) {
      // Se o roteamento automático estiver desabilitado, usa o provedor atual
      const currentModel = Object.values(availableModels)
        .find(model => model.provider === currentProvider && model.enabled);
      
      return currentModel || availableModels['gpt-4o-mini']; // Fallback para OpenAI
    }
    
    // Mapeamento de tarefas para forças dos modelos
    const taskToStrengths: Record<TaskType, string[]> = {
      'general': ['general', 'instruction-following'],
      'creative': ['creative', 'general'],
      'code': ['code', 'technical'],
      'reasoning': ['reasoning', 'academic'],
      'academic': ['academic', 'reasoning'],
      'summarization': ['general', 'instruction-following'],
      'extraction': ['technical', 'instruction-following']
    };
    
    // Pontuação para cada modelo com base na tarefa
    const modelScores = Object.values(availableModels)
      .filter(model => model.enabled)
      .map(model => {
        const strengthMatch = model.strengths.filter(
          s => taskToStrengths[task].includes(s)
        ).length;
        
        // Fatores de pontuação
        const strengthScore = strengthMatch * 10;
        const speedScore = userPreferences.preferSpeed ? (60000 - model.timeout) / 1000 : 0;
        const accuracyScore = userPreferences.preferAccuracy ? 
          (model.tier === 'expert' ? 30 : model.tier === 'advanced' ? 20 : 0) : 0;
        const costScore = costLimit < Infinity ? (1 / model.costPer1kTokens) * 5 : 0;
        
        // Adicionar bônus para modelo preferido baseado em feedback (mesmo com confiança baixa)
        const feedbackBonus = preference && preference.preferredModel === model.modelName ? 
          preference.confidenceScore * 15 : 0;
        
        return {
          model,
          score: strengthScore + speedScore + accuracyScore + costScore + feedbackBonus
        };
      })
      .sort((a, b) => b.score - a.score);
    
    return modelScores.length > 0 ? 
      modelScores[0].model : 
      availableModels['gpt-4o-mini']; // Fallback para OpenAI
  }, [currentProvider, enableAutoRouting, costLimit, userPreferences, feedbackPreferences]);

  // Função para registrar contexto de resposta para feedback
  const recordResponseContext = useCallback((context: {
    question: string;
    answer: string;
    modelName: string;
    provider: string;
    usedFallback: boolean;
    responseTime: number;
    tokensUsed: number;
  }): string => {
    // Armazenar contexto em localStorage para uso no componente de feedback
    const responseContext = {
      ...context,
      timestamp: new Date(),
      sessionId,
      userId
    };
    
    // Usar localStorage para armazenar temporariamente o contexto
    // Em uma implementação real, isso poderia ser armazenado em um estado global ou contexto
    localStorage.setItem(`response_context_${sessionId}`, JSON.stringify(responseContext));
    
    return sessionId;
  }, [sessionId, userId]);

  // Lista de provedores disponíveis
  const availableProviders = Object.values(availableModels)
    .filter(model => model.enabled)
    .map(model => model.provider)
    .filter((provider, index, self) => self.indexOf(provider) === index);

  // Modelo atual baseado no provedor selecionado
  const currentModel = Object.values(availableModels)
    .find(model => model.provider === currentProvider && model.enabled)?.modelName || 'gpt-4o-mini';

  return {
    currentProvider,
    currentModel,
    availableProviders,
    setProvider: setCurrentProvider,
    routeByTask,
    isProviderEnabled,
    toggleProvider,
    modelStats,
    recordResponseContext
  };
};

export default useLLMRouter;

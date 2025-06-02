
/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Hook para roteamento inteligente de modelos LLM baseado em feedback do usuário
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TaskType = 
  | 'general' 
  | 'code' 
  | 'creative' 
  | 'academic' 
  | 'reasoning' 
  | 'summarization' 
  | 'extraction';

export interface LLMModel {
  name: string;
  provider: string;
  endpoint?: string;
  maxTokens: number;
  costPerToken: number;
  avgResponseTime: number;
  isAvailable: boolean;
}

export interface LLMRouterConfig {
  models: LLMModel[];
  fallbackStrategy: 'fastest' | 'cheapest' | 'most_reliable';
  maxRetries: number;
  timeoutMs: number;
}

const DEFAULT_MODELS: LLMModel[] = [
  {
    name: 'gpt-4o',
    provider: 'openai',
    maxTokens: 4096,
    costPerToken: 0.00003,
    avgResponseTime: 2500,
    isAvailable: true
  },
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPerToken: 0.000002,
    avgResponseTime: 1500,
    isAvailable: true
  },
  {
    name: 'claude-3-sonnet',
    provider: 'anthropic',
    maxTokens: 4096,
    costPerToken: 0.000015,
    avgResponseTime: 2000,
    isAvailable: false
  }
];

export const useLLMRouter = () => {
  const [config, setConfig] = useState<LLMRouterConfig>({
    models: DEFAULT_MODELS,
    fallbackStrategy: 'most_reliable',
    maxRetries: 3,
    timeoutMs: 30000
  });
  
  const [preferences, setPreferences] = useState<Record<TaskType, string>>({
    general: 'gpt-4o',
    code: 'gpt-4o',
    creative: 'gpt-4o',
    academic: 'gpt-4o',
    reasoning: 'gpt-4o',
    summarization: 'gpt-3.5-turbo',
    extraction: 'gpt-3.5-turbo'
  });

  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [lastUsedModel, setLastUsedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar preferências do usuário do banco de dados
  const loadUserPreferences = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('llm_orchestrator_preferences')
        .select('task_type, preferred_model')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao carregar preferências:', error);
        return;
      }

      if (data && data.length > 0) {
        const userPrefs: Record<TaskType, string> = { ...preferences };
        
        data.forEach((pref) => {
          if (pref.task_type && pref.preferred_model) {
            userPrefs[pref.task_type as TaskType] = pref.preferred_model;
          }
        });
        
        setPreferences(userPrefs);
        console.log('🔧 Preferências do usuário carregadas:', userPrefs);
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar preferências:', error);
    }
  }, [preferences]);

  // Selecionar o melhor modelo para uma tarefa específica
  const selectModel = useCallback((taskType: TaskType, userInput?: string): LLMModel => {
    console.log(`🎯 Selecionando modelo para tarefa: ${taskType}`);
    
    // Usar preferência do usuário se disponível
    const preferredModelName = preferences[taskType];
    const preferredModel = config.models.find(
      model => model.name === preferredModelName && model.isAvailable
    );
    
    if (preferredModel) {
      console.log(`✅ Modelo preferido selecionado: ${preferredModel.name}`);
      setSelectedModel(preferredModel.name);
      setLastUsedModel(preferredModel.name);
      return preferredModel;
    }
    
    // Fallback: selecionar modelo com base na estratégia configurada
    const availableModels = config.models.filter(model => model.isAvailable);
    
    if (availableModels.length === 0) {
      throw new Error('Nenhum modelo LLM disponível');
    }
    
    let selectedModelObj: LLMModel;
    
    switch (config.fallbackStrategy) {
      case 'fastest':
        selectedModelObj = availableModels.reduce((fastest, current) => 
          current.avgResponseTime < fastest.avgResponseTime ? current : fastest
        );
        break;
        
      case 'cheapest':
        selectedModelObj = availableModels.reduce((cheapest, current) => 
          current.costPerToken < cheapest.costPerToken ? current : cheapest
        );
        break;
        
      case 'most_reliable':
      default:
        // Priorizar GPT-4o para tarefas complexas, GPT-3.5 para tarefas simples
        if (['code', 'reasoning', 'academic'].includes(taskType)) {
          selectedModelObj = availableModels.find(m => m.name === 'gpt-4o') || availableModels[0];
        } else {
          selectedModelObj = availableModels.find(m => m.name === 'gpt-3.5-turbo') || availableModels[0];
        }
        break;
    }
    
    console.log(`🔄 Modelo fallback selecionado: ${selectedModelObj.name}`);
    setSelectedModel(selectedModelObj.name);
    setLastUsedModel(selectedModelObj.name);
    return selectedModelObj;
  }, [config, preferences]);

  // Função para roteamento inteligente
  const routeToOptimalLLM = useCallback(async (input: string, taskType?: TaskType) => {
    setIsLoading(true);
    try {
      const detectedTaskType = taskType || detectTaskType(input);
      const optimalModel = selectModel(detectedTaskType, input);
      return {
        model: optimalModel,
        taskType: detectedTaskType,
        reasoning: `Selecionado ${optimalModel.name} para tarefa ${detectedTaskType}`
      };
    } finally {
      setIsLoading(false);
    }
  }, [selectModel]);

  // Detectar tipo de tarefa com base no input do usuário
  const detectTaskType = useCallback((userInput: string): TaskType => {
    const input = userInput.toLowerCase();
    
    // Código e programação
    if (input.includes('código') || input.includes('programar') || input.includes('function') || 
        input.includes('debug') || input.includes('algoritmo') || input.includes('javascript') ||
        input.includes('python') || input.includes('react') || input.includes('sql')) {
      return 'code';
    }
    
    // Criativo
    if (input.includes('criar') || input.includes('inventar') || input.includes('imagine') || 
        input.includes('história') || input.includes('poema') || input.includes('criativo')) {
      return 'creative';
    }
    
    // Acadêmico
    if (input.includes('pesquisa') || input.includes('estudo') || input.includes('análise') || 
        input.includes('acadêmico') || input.includes('científico') || input.includes('teoria')) {
      return 'academic';
    }
    
    // Raciocínio
    if (input.includes('por que') || input.includes('explique') || input.includes('como') || 
        input.includes('razão') || input.includes('lógica') || input.includes('porque')) {
      return 'reasoning';
    }
    
    // Resumo
    if (input.includes('resumir') || input.includes('resumo') || input.includes('sintetizar') || 
        input.includes('principais pontos') || input.includes('tl;dr')) {
      return 'summarization';
    }
    
    // Extração
    if (input.includes('extrair') || input.includes('encontrar') || input.includes('buscar') || 
        input.includes('localizar') || input.includes('identificar')) {
      return 'extraction';
    }
    
    return 'general';
  }, []);

  // Função para obter estatísticas dos modelos
  const getModelStats = useCallback(() => {
    return config.models.map(model => ({
      name: model.name,
      provider: model.provider,
      costPerToken: model.costPerToken,
      avgResponseTime: model.avgResponseTime,
      isAvailable: model.isAvailable,
      maxTokens: model.maxTokens
    }));
  }, [config.models]);

  // Função para selecionar melhor modelo
  const selectBestModel = useCallback((taskType: TaskType): string => {
    const model = selectModel(taskType);
    return model.name;
  }, [selectModel]);

  // Lista de modelos disponíveis
  const availableModels = config.models.filter(model => model.isAvailable).map(model => model.name);

  return {
    config,
    setConfig,
    preferences,
    selectedModel,
    lastUsedModel,
    isLoading,
    setIsLoading,
    loadUserPreferences,
    selectModel,
    routeToOptimalLLM,
    detectTaskType,
    getModelStats,
    selectBestModel,
    availableModels
  };
};

export default useLLMRouter;


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
      return preferredModel;
    }
    
    // Fallback: selecionar modelo com base na estratégia configurada
    const availableModels = config.models.filter(model => model.isAvailable);
    
    if (availableModels.length === 0) {
      throw new Error('Nenhum modelo LLM disponível');
    }
    
    let selectedModel: LLMModel;
    
    switch (config.fallbackStrategy) {
      case 'fastest':
        selectedModel = availableModels.reduce((fastest, current) => 
          current.avgResponseTime < fastest.avgResponseTime ? current : fastest
        );
        break;
        
      case 'cheapest':
        selectedModel = availableModels.reduce((cheapest, current) => 
          current.costPerToken < cheapest.costPerToken ? current : cheapest
        );
        break;
        
      case 'most_reliable':
      default:
        // Priorizar GPT-4o para tarefas complexas, GPT-3.5 para tarefas simples
        if (['code', 'reasoning', 'academic'].includes(taskType)) {
          selectedModel = availableModels.find(m => m.name === 'gpt-4o') || availableModels[0];
        } else {
          selectedModel = availableModels.find(m => m.name === 'gpt-3.5-turbo') || availableModels[0];
        }
        break;
    }
    
    console.log(`🔄 Modelo fallback selecionado: ${selectedModel.name}`);
    return selectedModel;
  }, [config, preferences]);

  // Log de chamada para o sistema de métricas
  const logLLMCall = useCallback(async (
    modelName: string,
    provider: string,
    taskType: TaskType,
    question: string,
    answerLength: number,
    startTime: Date,
    endTime: Date,
    tokensInput: number,
    tokensOutput: number,
    estimatedCost: number,
    status: 'success' | 'error' | 'timeout',
    userId: string,
    sessionId: string,
    usedFallback: boolean = false,
    errorMessage?: string
  ) => {
    try {
      const responseTime = endTime.getTime() - startTime.getTime();
      
      await supabase.from('llm_call_logs').insert({
        user_id: userId,
        session_id: sessionId,
        model_name: modelName,
        provider: provider,
        task_type: taskType,
        question: question,
        answer_length: answerLength,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        response_time: responseTime,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        total_tokens: tokensInput + tokensOutput,
        estimated_cost: estimatedCost,
        used_fallback: usedFallback,
        status: status,
        error_message: errorMessage,
        cache_hit: false, // TODO: implementar detecção de cache
        metadata: {
          task_type: taskType,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`📊 Log de chamada LLM registrado: ${modelName} - ${status}`);
    } catch (error) {
      console.error('Erro ao registrar log de chamada LLM:', error);
    }
  }, []);

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

  return {
    config,
    setConfig,
    preferences,
    loadUserPreferences,
    selectModel,
    detectTaskType,
    logLLMCall,
    isLoading,
    setIsLoading
  };
};

export default useLLMRouter;

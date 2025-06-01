
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Definir TaskType como tipo exportado
export type TaskType = 
  | 'question_answering'
  | 'code_generation'
  | 'creative_writing'
  | 'analysis'
  | 'planning'
  | 'research'
  | 'general'
  | 'chat'
  | 'document_analysis'
  | 'memory_retrieval';

// Interface para configuração de modelos LLM
interface LLMConfig {
  provider: string;
  model: string;
  maxTokens: number;
  temperature: number;
  costPerToken: number;
  capabilities: TaskType[];
}

// Configuração dos modelos disponíveis
const LLM_MODELS: Record<string, LLMConfig> = {
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.7,
    costPerToken: 0.00003,
    capabilities: ['question_answering', 'code_generation', 'creative_writing', 'analysis', 'planning', 'research', 'general', 'chat']
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 16384,
    temperature: 0.3,
    costPerToken: 0.000015,
    capabilities: ['question_answering', 'code_generation', 'analysis', 'general', 'chat', 'document_analysis']
  },
  'claude-3-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    temperature: 0.7,
    costPerToken: 0.000003,
    capabilities: ['creative_writing', 'analysis', 'planning', 'research', 'general']
  }
};

interface LLMRouterState {
  selectedModel: string;
  isLoading: boolean;
  lastUsedModel: string | null;
}

export function useLLMRouter() {
  const [state, setState] = useState<LLMRouterState>({
    selectedModel: 'gpt-4o-mini',
    isLoading: false,
    lastUsedModel: null
  });
  
  const { toast } = useToast();

  // Função para detectar o tipo de task automaticamente
  const detectTaskType = useCallback((input: string): TaskType => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('código') || lowerInput.includes('code') || lowerInput.includes('função')) {
      return 'code_generation';
    }
    if (lowerInput.includes('analis') || lowerInput.includes('avaliar') || lowerInput.includes('comparar')) {
      return 'analysis';
    }
    if (lowerInput.includes('criar') || lowerInput.includes('escrever') || lowerInput.includes('história')) {
      return 'creative_writing';
    }
    if (lowerInput.includes('plano') || lowerInput.includes('estratégia') || lowerInput.includes('organizar')) {
      return 'planning';
    }
    if (lowerInput.includes('pesquis') || lowerInput.includes('pesquis') || lowerInput.includes('investigar')) {
      return 'research';
    }
    if (lowerInput.includes('documento') || lowerInput.includes('arquivo') || lowerInput.includes('pdf')) {
      return 'document_analysis';
    }
    if (lowerInput.includes('lembr') || lowerInput.includes('memória') || lowerInput.includes('anterior')) {
      return 'memory_retrieval';
    }
    
    return 'general';
  }, []);

  // Função para selecionar o melhor modelo para uma tarefa
  const selectBestModel = useCallback((taskType: TaskType): string => {
    // Filtrar modelos que suportam a tarefa
    const compatibleModels = Object.entries(LLM_MODELS).filter(([_, config]) =>
      config.capabilities.includes(taskType)
    );

    if (compatibleModels.length === 0) {
      return 'gpt-4o-mini'; // fallback
    }

    // Para tarefas criativas, preferir modelos mais expressivos
    if (taskType === 'creative_writing') {
      const claudeModel = compatibleModels.find(([key]) => key.includes('claude'));
      if (claudeModel) return claudeModel[0];
    }

    // Para código, preferir GPT-4
    if (taskType === 'code_generation') {
      const gpt4Model = compatibleModels.find(([key]) => key === 'gpt-4o');
      if (gpt4Model) return gpt4Model[0];
    }

    // Para tarefas gerais, usar o modelo mais eficiente
    return compatibleModels[0][0];
  }, []);

  // Função principal para roteamento inteligente
  const routeToOptimalLLM = useCallback(async (
    input: string,
    forceModel?: string
  ): Promise<{ model: string; provider: string; taskType: TaskType }> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const taskType = detectTaskType(input);
      const optimalModel = forceModel || selectBestModel(taskType);
      const config = LLM_MODELS[optimalModel];

      if (!config) {
        throw new Error(`Modelo ${optimalModel} não encontrado`);
      }

      setState(prev => ({
        ...prev,
        selectedModel: optimalModel,
        lastUsedModel: optimalModel,
        isLoading: false
      }));

      console.log(`🤖 Roteamento LLM: ${taskType} -> ${optimalModel}`);

      return {
        model: optimalModel,
        provider: config.provider,
        taskType
      };
    } catch (error) {
      console.error('Erro no roteamento LLM:', error);
      
      toast({
        title: "Erro no roteamento",
        description: "Usando modelo padrão",
        variant: "destructive",
      });

      setState(prev => ({ ...prev, isLoading: false }));
      
      return {
        model: 'gpt-4o-mini',
        provider: 'openai',
        taskType: 'general'
      };
    }
  }, [detectTaskType, selectBestModel, toast]);

  // Função para obter estatísticas dos modelos
  const getModelStats = useCallback(() => {
    return Object.entries(LLM_MODELS).map(([key, config]) => ({
      id: key,
      name: config.model,
      provider: config.provider,
      costPerToken: config.costPerToken,
      capabilities: config.capabilities.length,
      maxTokens: config.maxTokens
    }));
  }, []);

  return {
    selectedModel: state.selectedModel,
    isLoading: state.isLoading,
    lastUsedModel: state.lastUsedModel,
    routeToOptimalLLM,
    getModelStats,
    detectTaskType,
    selectBestModel,
    availableModels: Object.keys(LLM_MODELS)
  };
}

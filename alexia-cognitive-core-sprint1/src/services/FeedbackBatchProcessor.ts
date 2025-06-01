/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Serviço de processamento em batch para feedback do sistema multi-LLM
 * Implementa lógica de ajuste periódico do orquestrador com base no feedback acumulado
 */

import { createClient } from '@supabase/supabase-js';
import { TaskType } from '@/hooks/useLLMRouter';

// Interface para estatísticas de feedback por modelo e tarefa
interface ModelFeedbackStats {
  modelName: string;
  provider: string;
  taskType: TaskType;
  positiveCount: number;
  negativeCount: number;
  averageScore: number;
  responseTime: number;
  tokensUsed: number;
  sampleSize: number;
}

/**
 * Serviço para processamento em batch de feedback do usuário
 * e ajuste das preferências do orquestrador multi-LLM
 */
export class FeedbackBatchProcessor {
  private supabase;
  private batchId: string | null = null;
  
  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string
    );
  }
  
  /**
   * Inicia um novo processamento em batch
   */
  async startBatchProcessing(): Promise<string> {
    try {
      // Registrar início do processamento
      const { data, error } = await this.supabase
        .from('llm_feedback_batch_processing')
        .insert({
          batch_size: 0, // Será atualizado após contagem
          start_time: new Date().toISOString(),
          status: 'started'
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      this.batchId = data.id;
      return this.batchId;
    } catch (error) {
      console.error('Erro ao iniciar processamento em batch:', error);
      throw error;
    }
  }
  
  /**
   * Processa feedback não processado e atualiza preferências do orquestrador
   */
  async processFeedback(): Promise<number> {
    if (!this.batchId) {
      throw new Error('Batch não iniciado. Chame startBatchProcessing primeiro.');
    }
    
    try {
      // Buscar feedback não processado
      const { data: feedbackItems, error: fetchError } = await this.supabase
        .from('llm_feedback')
        .select('*')
        .eq('processed', false)
        .order('timestamp', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      if (!feedbackItems || feedbackItems.length === 0) {
        await this.completeBatch(0);
        return 0;
      }
      
      // Atualizar tamanho do batch
      await this.supabase
        .from('llm_feedback_batch_processing')
        .update({ batch_size: feedbackItems.length })
        .eq('id', this.batchId);
      
      // Agrupar feedback por usuário, tipo de tarefa e modelo
      const feedbackStats = this.aggregateFeedbackStats(feedbackItems);
      
      // Atualizar preferências do orquestrador
      let preferencesUpdated = 0;
      
      for (const userId of Object.keys(feedbackStats)) {
        for (const taskType of Object.keys(feedbackStats[userId])) {
          // Encontrar o modelo com melhor desempenho para esta tarefa
          const bestModel = this.findBestModelForTask(
            feedbackStats[userId][taskType]
          );
          
          if (bestModel) {
            // Atualizar preferência no banco de dados
            await this.updateOrchestratorPreference(
              userId,
              taskType as TaskType,
              bestModel.modelName,
              this.calculateConfidenceScore(bestModel)
            );
            
            preferencesUpdated++;
          }
        }
      }
      
      // Marcar feedback como processado
      const feedbackIds = feedbackItems.map(item => item.id);
      await this.supabase
        .from('llm_feedback')
        .update({
          processed: true,
          processed_at: new Date().toISOString()
        })
        .in('id', feedbackIds);
      
      // Completar o batch
      await this.completeBatch(preferencesUpdated);
      
      return preferencesUpdated;
    } catch (error) {
      console.error('Erro ao processar feedback:', error);
      
      // Registrar falha
      await this.supabase
        .from('llm_feedback_batch_processing')
        .update({
          status: 'failed',
          end_time: new Date().toISOString(),
          error_message: error.message || 'Erro desconhecido'
        })
        .eq('id', this.batchId);
      
      throw error;
    }
  }
  
  /**
   * Agrega estatísticas de feedback por usuário, tipo de tarefa e modelo
   */
  private aggregateFeedbackStats(feedbackItems: any[]): Record<string, Record<string, ModelFeedbackStats[]>> {
    const stats: Record<string, Record<string, ModelFeedbackStats[]>> = {};
    
    // Função para inferir o tipo de tarefa com base na pergunta
    const inferTaskType = (question: string): TaskType => {
      // Lógica simplificada para inferir o tipo de tarefa
      if (question.includes('código') || question.includes('programação')) {
        return 'code';
      } else if (question.includes('resumo') || question.includes('resumir')) {
        return 'summarization';
      } else if (question.includes('criativo') || question.includes('imagine')) {
        return 'creative';
      } else if (question.includes('explique') || question.includes('por que')) {
        return 'reasoning';
      } else if (question.includes('acadêmico') || question.includes('pesquisa')) {
        return 'academic';
      } else if (question.includes('extrair') || question.includes('encontre')) {
        return 'extraction';
      } else {
        return 'general';
      }
    };
    
    // Processar cada item de feedback
    for (const item of feedbackItems) {
      const userId = item.user_id;
      const taskType = inferTaskType(item.question);
      const modelName = item.model_name;
      const provider = item.provider;
      
      // Inicializar estruturas se necessário
      if (!stats[userId]) {
        stats[userId] = {};
      }
      
      if (!stats[userId][taskType]) {
        stats[userId][taskType] = [];
      }
      
      // Verificar se já temos estatísticas para este modelo
      let modelStats = stats[userId][taskType].find(
        s => s.modelName === modelName && s.provider === provider
      );
      
      if (!modelStats) {
        modelStats = {
          modelName,
          provider,
          taskType: taskType as TaskType,
          positiveCount: 0,
          negativeCount: 0,
          averageScore: 0,
          responseTime: 0,
          tokensUsed: 0,
          sampleSize: 0
        };
        stats[userId][taskType].push(modelStats);
      }
      
      // Atualizar estatísticas
      if (item.rating === 'positive') {
        modelStats.positiveCount++;
      } else if (item.rating === 'negative') {
        modelStats.negativeCount++;
      }
      
      if (item.score) {
        // Atualizar média ponderada da pontuação
        const currentTotal = modelStats.averageScore * modelStats.sampleSize;
        modelStats.sampleSize++;
        modelStats.averageScore = (currentTotal + item.score) / modelStats.sampleSize;
      }
      
      // Atualizar métricas de performance
      modelStats.responseTime = (modelStats.responseTime * modelStats.sampleSize + item.response_time) / 
                               (modelStats.sampleSize + 1);
      modelStats.tokensUsed = (modelStats.tokensUsed * modelStats.sampleSize + item.tokens_used) / 
                             (modelStats.sampleSize + 1);
      modelStats.sampleSize++;
    }
    
    return stats;
  }
  
  /**
   * Encontra o melhor modelo para um tipo de tarefa com base no feedback
   */
  private findBestModelForTask(modelStats: ModelFeedbackStats[]): ModelFeedbackStats | null {
    if (!modelStats || modelStats.length === 0) {
      return null;
    }
    
    // Calcular pontuação para cada modelo
    const scoredModels = modelStats.map(stats => {
      // Calcular taxa de feedback positivo
      const totalFeedback = stats.positiveCount + stats.negativeCount;
      const positiveRate = totalFeedback > 0 ? stats.positiveCount / totalFeedback : 0;
      
      // Normalizar tempo de resposta (menor é melhor)
      // Assumindo que 10000ms (10s) é o tempo máximo aceitável
      const normalizedResponseTime = Math.max(0, 1 - stats.responseTime / 10000);
      
      // Calcular pontuação composta
      // 60% feedback positivo, 20% pontuação média, 10% tempo de resposta, 10% tamanho da amostra
      const compositeScore = 
        (positiveRate * 0.6) + 
        ((stats.averageScore / 5) * 0.2) + 
        (normalizedResponseTime * 0.1) + 
        (Math.min(1, stats.sampleSize / 20) * 0.1);
      
      return {
        ...stats,
        compositeScore
      };
    });
    
    // Ordenar por pontuação composta e retornar o melhor
    scoredModels.sort((a, b) => b.compositeScore - a.compositeScore);
    return scoredModels[0];
  }
  
  /**
   * Calcula pontuação de confiança para um modelo
   */
  private calculateConfidenceScore(modelStats: ModelFeedbackStats): number {
    // Calcular taxa de feedback positivo
    const totalFeedback = modelStats.positiveCount + modelStats.negativeCount;
    const positiveRate = totalFeedback > 0 ? modelStats.positiveCount / totalFeedback : 0.5;
    
    // Ajustar confiança com base no tamanho da amostra
    // Quanto maior a amostra, mais confiamos na taxa positiva
    const sampleSizeFactor = Math.min(1, modelStats.sampleSize / 50);
    
    // Combinar taxa positiva com tamanho da amostra
    // Se amostra pequena, tendemos para 0.5 (neutro)
    // Se amostra grande, tendemos para a taxa positiva real
    return 0.5 * (1 - sampleSizeFactor) + positiveRate * sampleSizeFactor;
  }
  
  /**
   * Atualiza preferência do orquestrador no banco de dados
   */
  private async updateOrchestratorPreference(
    userId: string,
    taskType: TaskType,
    modelName: string,
    confidenceScore: number
  ): Promise<void> {
    try {
      // Verificar se já existe uma preferência para este usuário e tarefa
      const { data, error: fetchError } = await this.supabase
        .from('llm_orchestrator_preferences')
        .select('id')
        .eq('user_id', userId)
        .eq('task_type', taskType)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Atualizar preferência existente
        const { error: updateError } = await this.supabase
          .from('llm_orchestrator_preferences')
          .update({
            preferred_model: modelName,
            confidence_score: confidenceScore
          })
          .eq('id', data.id);
        
        if (updateError) throw updateError;
      } else {
        // Criar nova preferência
        const { error: insertError } = await this.supabase
          .from('llm_orchestrator_preferences')
          .insert({
            user_id: userId,
            task_type: taskType,
            preferred_model: modelName,
            confidence_score: confidenceScore
          });
        
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Erro ao atualizar preferência do orquestrador:', error);
      throw error;
    }
  }
  
  /**
   * Completa o processamento em batch
   */
  private async completeBatch(preferencesUpdated: number): Promise<void> {
    if (!this.batchId) return;
    
    try {
      await this.supabase
        .from('llm_feedback_batch_processing')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          preferences_updated: preferencesUpdated
        })
        .eq('id', this.batchId);
    } catch (error) {
      console.error('Erro ao completar batch:', error);
    }
  }
}

export default FeedbackBatchProcessor;

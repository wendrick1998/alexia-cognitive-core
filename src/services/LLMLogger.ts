
/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Serviço de logging centralizado para chamadas LLM
 */

import { supabase } from '@/integrations/supabase/client';
import { TaskType } from '@/hooks/useLLMRouter';

export interface LLMCallLog {
  modelName: string;
  provider: string;
  taskType: TaskType;
  question: string;
  answer: string;
  startTime: Date;
  endTime: Date;
  tokensInput: number;
  tokensOutput: number;
  estimatedCost: number;
  userId: string;
  sessionId: string;
  usedFallback?: boolean;
  fallbackReason?: string;
  cacheHit?: boolean;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
}

export interface LLMMetrics {
  modelName: string;
  provider: string;
  totalCalls: number;
  successRate: number;
  avgResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  fallbackRate: number;
  cacheHitRate: number;
}

export class LLMLogger {
  private static instance: LLMLogger;
  private logQueue: LLMCallLog[] = [];
  private isProcessing = false;

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): LLMLogger {
    if (!LLMLogger.instance) {
      LLMLogger.instance = new LLMLogger();
    }
    return LLMLogger.instance;
  }

  /**
   * Adiciona um log à fila de processamento
   */
  public async logCall(logData: LLMCallLog): Promise<void> {
    console.log(`📝 Adicionando log à fila: ${logData.modelName} - ${logData.status}`);
    
    this.logQueue.push(logData);
    
    // Processar fila se não estiver processando
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Processa a fila de logs
   */
  private async processQueue(): Promise<void> {
    if (this.logQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    
    try {
      while (this.logQueue.length > 0) {
        const logData = this.logQueue.shift();
        if (logData) {
          await this.saveSingleLog(logData);
        }
      }
    } catch (error) {
      console.error('Erro ao processar fila de logs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Salva um único log no banco de dados
   */
  private async saveSingleLog(logData: LLMCallLog): Promise<void> {
    try {
      const responseTime = logData.endTime.getTime() - logData.startTime.getTime();
      
      const { error } = await supabase.from('llm_call_logs').insert({
        user_id: logData.userId,
        session_id: logData.sessionId,
        model_name: logData.modelName,
        provider: logData.provider,
        task_type: logData.taskType,
        question: logData.question,
        answer_length: logData.answer.length,
        start_time: logData.startTime.toISOString(),
        end_time: logData.endTime.toISOString(),
        response_time: responseTime,
        tokens_input: logData.tokensInput,
        tokens_output: logData.tokensOutput,
        total_tokens: logData.tokensInput + logData.tokensOutput,
        estimated_cost: logData.estimatedCost,
        used_fallback: logData.usedFallback || false,
        fallback_reason: logData.fallbackReason,
        cache_hit: logData.cacheHit || false,
        status: logData.status,
        error_message: logData.errorMessage,
        metadata: {
          task_type: logData.taskType,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          answer_preview: logData.answer.substring(0, 100)
        }
      });

      if (error) {
        throw error;
      }

      console.log(`✅ Log salvo com sucesso: ${logData.modelName} - ${responseTime}ms`);
    } catch (error) {
      console.error('Erro ao salvar log individual:', error);
      // Re-adicionar à fila para tentar novamente
      this.logQueue.push(logData);
    }
  }

  /**
   * Obtém estatísticas de uso por modelo
   */
  public async getModelStats(
    modelName?: string, 
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('llm_call_logs')
        .select('model_name, provider, status, response_time, total_tokens, estimated_cost');

      if (modelName) {
        query = query.eq('model_name', modelName);
      }

      // Filtrar por período
      const now = new Date();
      let startTime: Date;
      
      switch (timeframe) {
        case 'hour':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      query = query.gte('created_at', startTime.toISOString());

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao obter estatísticas do modelo:', error);
      return [];
    }
  }

  /**
   * Força o processamento da fila (útil para testes)
   */
  public async flush(): Promise<void> {
    await this.processQueue();
  }
}

export const llmLogger = LLMLogger.getInstance();
export default llmLogger;

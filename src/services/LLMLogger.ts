
/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Serviço de logs inteligentes para o sistema multi-LLM
 * Implementa registro detalhado de métricas por modelo, incluindo tempo, custo e fallback
 */

import { supabase } from '@/integrations/supabase/client';

// Interface para registro de chamada LLM
export interface LLMCallLog {
  id?: string;
  userId: string;
  sessionId: string;
  modelName: string;
  provider: string;
  taskType: string;
  question: string;
  answerLength: number;
  startTime: Date;
  endTime: Date;
  responseTime: number; // em milissegundos
  tokensInput: number;
  tokensOutput: number;
  totalTokens: number;
  estimatedCost: number;
  usedFallback: boolean;
  fallbackReason?: string;
  fallbackModel?: string;
  cacheHit: boolean;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Interface para métricas agregadas
export interface LLMMetrics {
  modelName: string;
  provider: string;
  totalCalls: number;
  successRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  fallbackRate: number;
  cacheHitRate: number;
}

// Opções de configuração para logs
interface LLMLoggerOptions {
  enableRealTimeLogging?: boolean;
  batchSize?: number;
  flushInterval?: number; // em milissegundos
  userId?: string;
  sessionId?: string;
}

/**
 * Serviço de logs inteligentes para o sistema multi-LLM
 * Registra métricas detalhadas por modelo e fornece análises
 */
export class LLMLogger {
  private options: Required<LLMLoggerOptions>;
  private logQueue: LLMCallLog[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private modelCostMap: Record<string, number> = {
    'gpt-4o-mini': 0.00015, // $0.15 por 1K tokens
    'claude-3-opus': 0.00075, // $0.75 por 1K tokens
    'deepseek-coder': 0.0002, // $0.20 por 1K tokens
    'groq-mixtral': 0.0001 // $0.10 por 1K tokens
  };
  
  constructor(options: LLMLoggerOptions = {}) {
    // Definir opções padrão
    this.options = {
      enableRealTimeLogging: options.enableRealTimeLogging ?? true,
      batchSize: options.batchSize ?? 10,
      flushInterval: options.flushInterval ?? 30000, // 30 segundos
      userId: options.userId ?? 'anonymous',
      sessionId: options.sessionId ?? `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    
    // Iniciar timer para flush periódico
    this.startFlushTimer();
  }
  
  /**
   * Inicia o timer para flush periódico dos logs
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.options.flushInterval);
  }
  
  /**
   * Calcula o custo estimado de uma chamada LLM
   */
  private calculateCost(modelName: string, totalTokens: number): number {
    const costPer1KTokens = this.modelCostMap[modelName] || 0.0002; // Custo padrão se modelo desconhecido
    return (totalTokens / 1000) * costPer1KTokens;
  }
  
  /**
   * Registra o início de uma chamada LLM
   * Retorna um ID de chamada para ser usado no logEnd
   */
  async logStart(
    modelName: string,
    provider: string,
    taskType: string,
    question: string,
    tokensInput: number,
    metadata?: Record<string, any>
  ): Promise<string> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Armazenar temporariamente em localStorage para recuperar no logEnd
    const startData = {
      callId,
      startTime: new Date(),
      modelName,
      provider,
      taskType,
      question,
      tokensInput,
      metadata
    };
    
    localStorage.setItem(`llm_call_${callId}`, JSON.stringify(startData));
    
    return callId;
  }
  
  /**
   * Registra o fim de uma chamada LLM
   */
  async logEnd(
    callId: string,
    answerLength: number,
    tokensOutput: number,
    status: 'success' | 'error' | 'timeout',
    options: {
      usedFallback?: boolean;
      fallbackReason?: string;
      fallbackModel?: string;
      cacheHit?: boolean;
      errorMessage?: string;
      additionalMetadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    // Recuperar dados do início da chamada
    const startDataJson = localStorage.getItem(`llm_call_${callId}`);
    if (!startDataJson) {
      console.error(`No start data found for call ID: ${callId}`);
      return;
    }
    
    const startData = JSON.parse(startDataJson);
    const endTime = new Date();
    const startTime = new Date(startData.startTime);
    const responseTime = endTime.getTime() - startTime.getTime();
    const totalTokens = startData.tokensInput + tokensOutput;
    const estimatedCost = this.calculateCost(startData.modelName, totalTokens);
    
    // Criar log completo
    const logEntry: LLMCallLog = {
      userId: this.options.userId,
      sessionId: this.options.sessionId,
      modelName: startData.modelName,
      provider: startData.provider,
      taskType: startData.taskType,
      question: startData.question,
      answerLength,
      startTime,
      endTime,
      responseTime,
      tokensInput: startData.tokensInput,
      tokensOutput,
      totalTokens,
      estimatedCost,
      usedFallback: options.usedFallback || false,
      fallbackReason: options.fallbackReason,
      fallbackModel: options.fallbackModel,
      cacheHit: options.cacheHit || false,
      status,
      errorMessage: options.errorMessage,
      metadata: {
        ...startData.metadata,
        ...options.additionalMetadata
      }
    };
    
    // Adicionar à fila de logs
    this.logQueue.push(logEntry);
    
    // Limpar dados temporários
    localStorage.removeItem(`llm_call_${callId}`);
    
    // Se logging em tempo real estiver ativado ou a fila atingir o tamanho do batch, fazer flush
    if (this.options.enableRealTimeLogging || this.logQueue.length >= this.options.batchSize) {
      await this.flushLogs();
    }
  }
  
  /**
   * Envia logs acumulados para o Supabase
   */
  async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;
    
    const logsToFlush = [...this.logQueue];
    this.logQueue = [];
    
    try {
      // Converter para formato da tabela
      const formattedLogs = logsToFlush.map(log => ({
        user_id: log.userId,
        session_id: log.sessionId,
        model_name: log.modelName,
        provider: log.provider,
        task_type: log.taskType,
        question: log.question,
        answer_length: log.answerLength,
        start_time: log.startTime.toISOString(),
        end_time: log.endTime.toISOString(),
        response_time: log.responseTime,
        tokens_input: log.tokensInput,
        tokens_output: log.tokensOutput,
        total_tokens: log.totalTokens,
        estimated_cost: log.estimatedCost,
        used_fallback: log.usedFallback,
        fallback_reason: log.fallbackReason,
        fallback_model: log.fallbackModel,
        cache_hit: log.cacheHit,
        status: log.status,
        error_message: log.errorMessage,
        metadata: log.metadata || {}
      }));
      
      // Inserir logs no Supabase
      const { error } = await supabase
        .from('llm_call_logs')
        .insert(formattedLogs);
      
      if (error) throw error;
      
      console.log(`Successfully flushed ${logsToFlush.length} LLM call logs`);
    } catch (error) {
      console.error('Error flushing LLM logs:', error);
      
      // Recolocar logs na fila para tentar novamente mais tarde
      this.logQueue = [...logsToFlush, ...this.logQueue];
    }
  }
  
  /**
   * Limpa recursos ao destruir a instância
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Fazer flush final dos logs pendentes
    this.flushLogs();
  }
}

export default LLMLogger;

/**
 * @description Serviço para logging e estatísticas de modelos LLM
 * @created_by Manus AI - System Monitoring
 */

export interface LLMLogEntry {
  id: string;
  model: string;
  provider: string;
  timestamp: Date;
  tokens_used: number;
  response_time: number;
  success: boolean;
  error?: string;
}

export interface ModelStats {
  model: string;
  provider: string;
  total_calls: number;
  total_tokens: number;
  average_response_time: number;
  success_rate: number;
  last_used: Date;
}

export class LLMLogger {
  private logs: LLMLogEntry[] = [];

  async logRequest(entry: Omit<LLMLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: LLMLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };

    this.logs.push(logEntry);

    // Keep only last 1000 entries
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    console.log('LLM Request logged:', logEntry);
  }

  async getModelStats(): Promise<ModelStats[]> {
    const statsMap = new Map<string, ModelStats>();

    this.logs.forEach(log => {
      const key = `${log.model}_${log.provider}`;
      
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          model: log.model,
          provider: log.provider,
          total_calls: 0,
          total_tokens: 0,
          average_response_time: 0,
          success_rate: 0,
          last_used: log.timestamp
        });
      }

      const stats = statsMap.get(key)!;
      stats.total_calls++;
      stats.total_tokens += log.tokens_used;
      stats.average_response_time = (stats.average_response_time * (stats.total_calls - 1) + log.response_time) / stats.total_calls;
      
      if (log.timestamp > stats.last_used) {
        stats.last_used = log.timestamp;
      }
    });

    // Calculate success rates
    statsMap.forEach(stats => {
      const modelLogs = this.logs.filter(log => log.model === stats.model && log.provider === stats.provider);
      const successfulCalls = modelLogs.filter(log => log.success).length;
      stats.success_rate = (successfulCalls / modelLogs.length) * 100;
    });

    return Array.from(statsMap.values());
  }

  async getLogs(limit: number = 50): Promise<LLMLogEntry[]> {
    return this.logs.slice(-limit).reverse();
  }

  async clearLogs(): Promise<void> {
    this.logs = [];
  }
}

// Export singleton instance
export const llmLogger = new LLMLogger();

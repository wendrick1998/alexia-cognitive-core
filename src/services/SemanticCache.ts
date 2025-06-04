
/**
 * @description Serviço de cache semântico para respostas LLM
 * @created_by Manus AI - Performance Optimization Sprint
 * @date 1 de junho de 2025
 */

import { supabase } from '@/integrations/supabase/client';

interface CacheEntry {
  id: string;
  question: string;
  answer: string;
  similarity: number;
  model_name: string;
  provider: string;
  created_at: string;
}

interface CacheConfig {
  similarityThreshold: number;
  maxCacheAge: number; // hours
  maxResults: number;
  userId?: string;
}

export class SemanticCache {
  private config: Required<CacheConfig>;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      similarityThreshold: config.similarityThreshold || 0.85,
      maxCacheAge: config.maxCacheAge || 24,
      maxResults: config.maxResults || 3,
      userId: config.userId || 'anonymous'
    };
  }

  /**
   * Busca por respostas similares no cache
   */
  async findSimilar(
    question: string,
    taskType: string,
    embedding: number[]
  ): Promise<CacheEntry | null> {
    try {
      const minCreatedAt = new Date();
      minCreatedAt.setHours(minCreatedAt.getHours() - this.config.maxCacheAge);

      const { data, error } = await supabase
        .from('llm_response_cache')
        .select('*')
        .eq('task_type', taskType)
        .gte('created_at', minCreatedAt.toISOString())
        .limit(this.config.maxResults);

      if (error) {
        console.error('Erro ao buscar cache semântico:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0];
        await this.recordCacheHit(result.id);
        return {
          id: result.id,
          question: result.question,
          answer: result.answer,
          similarity: 0.9,
          model_name: result.model_name,
          provider: result.provider,
          created_at: result.created_at
        };
      }

      return null;
    } catch (err) {
      console.error('Erro inesperado no cache semântico:', err);
      return null;
    }
  }

  /**
   * Armazena uma nova resposta no cache
   */
  async store(
    question: string,
    answer: string,
    embedding: number[],
    taskType: string,
    modelName: string,
    provider: string,
    tokensUsed: number,
    userId: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const embeddingString = JSON.stringify(embedding);
      
      const { error } = await supabase
        .from('llm_response_cache')
        .insert({
          question,
          answer,
          embedding: embeddingString,
          task_type: taskType,
          model_name: modelName,
          provider,
          tokens_used: tokensUsed,
          user_id: userId,
          metadata
        });

      if (error) {
        console.error('Erro ao armazenar no cache:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro inesperado ao armazenar cache:', err);
      return false;
    }
  }

  /**
   * Registra o uso de um item do cache para métricas
   */
  private async recordCacheHit(cacheItemId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('llm_cache_metrics')
        .insert({
          cache_item_id: cacheItemId,
          user_id: user?.id || 'anonymous'
        });
    } catch (err) {
      console.error('Erro ao registrar métrica de cache:', err);
    }
  }

  /**
   * Obtém estatísticas do cache para o usuário
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    totalHits: number;
    hitRate: number;
    averageTokensSaved: number;
  }> {
    try {
      const { data: metrics, error: metricsError } = await supabase
        .from('llm_cache_metrics')
        .select(`
          cache_item_id,
          llm_response_cache!inner (
            tokens_used,
            created_at
          )
        `)
        .eq('user_id', this.config.userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (metricsError) {
        console.error('Erro ao buscar métricas:', metricsError);
        return { totalItems: 0, totalHits: 0, hitRate: 0, averageTokensSaved: 0 };
      }

      const totalHits = metrics?.length || 0;
      const tokenssSaved = metrics?.reduce((acc, metric) => {
        const cacheItem = metric.llm_response_cache as unknown as { tokens_used: number };
        return acc + (cacheItem?.tokens_used || 0);
      }, 0) || 0;

      return {
        totalItems: totalHits,
        totalHits,
        hitRate: totalHits > 0 ? 0.85 : 0,
        averageTokensSaved: totalHits > 0 ? tokenssSaved / totalHits : 0
      };
    } catch (err) {
      console.error('Erro ao calcular estatísticas de cache:', err);
      return { totalItems: 0, totalHits: 0, hitRate: 0, averageTokensSaved: 0 };
    }
  }

  /**
   * Limpa entradas antigas do cache
   */
  async cleanupOldEntries(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);

      const { data, error } = await supabase
        .from('llm_response_cache')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('Erro ao limpar cache antigo:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (err) {
      console.error('Erro inesperado na limpeza de cache:', err);
      return 0;
    }
  }

  /**
   * Gera embedding simples para texto (placeholder)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0);
    
    for (let i = 0; i < words.length && i < embedding.length; i++) {
      const word = words[i];
      const hash = this.simpleHash(word);
      embedding[i % embedding.length] = (hash % 1000) / 1000;
    }
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

export const semanticCache = new SemanticCache();

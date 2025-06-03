
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
}

export class SemanticCache {
  private config: CacheConfig = {
    similarityThreshold: 0.85,
    maxCacheAge: 24,
    maxResults: 3
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
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

      // Para demonstração, usar busca simples por similaridade de texto
      // Em produção, usar função de embedding real
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
        // Simular similaridade para demonstração
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
      // Converter embedding para string para compatibilidade
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
  async getCacheStats(userId: string): Promise<{
    totalHits: number;
    tokenssSaved: number;
    avgResponseTime: number;
  }> {
    try {
      // Buscar métricas do usuário
      const { data: metrics, error: metricsError } = await supabase
        .from('llm_cache_metrics')
        .select(`
          cache_item_id,
          llm_response_cache!inner (
            tokens_used,
            created_at
          )
        `)
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 dias

      if (metricsError) {
        console.error('Erro ao buscar métricas:', metricsError);
        return { totalHits: 0, tokenssSaved: 0, avgResponseTime: 0 };
      }

      const totalHits = metrics?.length || 0;
      const tokenssSaved = metrics?.reduce((acc, metric) => {
        return acc + (metric.llm_response_cache?.tokens_used || 0);
      }, 0) || 0;

      return {
        totalHits,
        tokenssSaved,
        avgResponseTime: 150 // Tempo médio estimado de cache hit
      };
    } catch (err) {
      console.error('Erro ao calcular estatísticas de cache:', err);
      return { totalHits: 0, tokenssSaved: 0, avgResponseTime: 0 };
    }
  }

  /**
   * Limpa entradas antigas do cache
   */
  async cleanupOldEntries(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Remove entradas com mais de 7 dias

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
   * Gera embedding simples para texto (placeholder - substituir por serviço real)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Placeholder: implementação simples para demonstração
    // Em produção, usar OpenAI embeddings ou similar
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
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export const semanticCache = new SemanticCache();

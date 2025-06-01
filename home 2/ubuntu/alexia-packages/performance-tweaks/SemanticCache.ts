/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Serviço de cache semântico para respostas LLM
 * Implementa armazenamento e recuperação de respostas baseado em similaridade semântica
 */

import { createClient } from '@supabase/supabase-js';
import { TaskType } from '@/hooks/useLLMRouter';

// Interface para item de cache
interface CacheItem {
  id: string;
  question: string;
  answer: string;
  embedding: number[];
  modelName: string;
  provider: string;
  taskType: TaskType;
  tokensUsed: number;
  createdAt: Date;
  userId: string;
  metadata?: Record<string, any>;
}

// Interface para resultado de similaridade
interface SimilarityResult {
  id: string;
  question: string;
  answer: string;
  similarity: number;
  modelName: string;
  provider: string;
}

// Opções de configuração do cache
interface SemanticCacheOptions {
  similarityThreshold?: number; // Limiar de similaridade (0-1)
  maxCacheAge?: number; // Idade máxima do cache em milissegundos
  embeddingModel?: string; // Modelo de embedding a ser usado
  userId?: string; // ID do usuário para cache personalizado
}

/**
 * Serviço de cache semântico para respostas LLM
 * Usa embeddings para comparar similaridade entre perguntas
 */
export class SemanticCache {
  private supabase;
  private options: Required<SemanticCacheOptions>;
  
  constructor(options: SemanticCacheOptions = {}) {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string
    );
    
    // Definir opções padrão
    this.options = {
      similarityThreshold: options.similarityThreshold || 0.85,
      maxCacheAge: options.maxCacheAge || 7 * 24 * 60 * 60 * 1000, // 7 dias
      embeddingModel: options.embeddingModel || 'text-embedding-ada-002',
      userId: options.userId || 'anonymous'
    };
  }
  
  /**
   * Gera embedding para uma pergunta usando o modelo configurado
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Usar API OpenAI para gerar embedding
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          input: text,
          model: this.options.embeddingModel
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error generating embedding: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      // Fallback para embedding vazio em caso de erro
      return new Array(1536).fill(0);
    }
  }
  
  /**
   * Busca respostas similares no cache
   */
  async findSimilarResponses(question: string, taskType: TaskType): Promise<SimilarityResult[]> {
    try {
      // Gerar embedding para a pergunta
      const embedding = await this.generateEmbedding(question);
      
      // Calcular timestamp mínimo baseado na idade máxima do cache
      const minTimestamp = new Date(Date.now() - this.options.maxCacheAge).toISOString();
      
      // Buscar itens similares usando função de similaridade de cosseno do Postgres
      const { data, error } = await this.supabase.rpc('match_question_embeddings', {
        query_embedding: embedding,
        similarity_threshold: this.options.similarityThreshold,
        match_count: 5, // Limitar a 5 resultados
        min_created_at: minTimestamp,
        task_type: taskType
      });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Mapear resultados
      return data.map((item: any) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        similarity: item.similarity,
        modelName: item.model_name,
        provider: item.provider
      }));
    } catch (error) {
      console.error('Error finding similar responses:', error);
      return [];
    }
  }
  
  /**
   * Verifica se há uma resposta em cache para a pergunta
   */
  async getCachedResponse(question: string, taskType: TaskType): Promise<string | null> {
    try {
      const similarResponses = await this.findSimilarResponses(question, taskType);
      
      // Se encontrou respostas similares acima do limiar, retornar a mais similar
      if (similarResponses.length > 0) {
        // Registrar uso do cache para métricas
        await this.recordCacheHit(similarResponses[0].id);
        return similarResponses[0].answer;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached response:', error);
      return null;
    }
  }
  
  /**
   * Adiciona uma resposta ao cache
   */
  async cacheResponse(
    question: string,
    answer: string,
    taskType: TaskType,
    modelName: string,
    provider: string,
    tokensUsed: number,
    metadata?: Record<string, any>
  ): Promise<string | null> {
    try {
      // Gerar embedding para a pergunta
      const embedding = await this.generateEmbedding(question);
      
      // Inserir no banco de dados
      const { data, error } = await this.supabase
        .from('llm_response_cache')
        .insert({
          question,
          answer,
          embedding,
          task_type: taskType,
          model_name: modelName,
          provider,
          tokens_used: tokensUsed,
          user_id: this.options.userId,
          metadata: metadata || {}
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error caching response:', error);
      return null;
    }
  }
  
  /**
   * Registra um hit de cache para métricas
   */
  private async recordCacheHit(cacheItemId: string): Promise<void> {
    try {
      await this.supabase
        .from('llm_cache_metrics')
        .insert({
          cache_item_id: cacheItemId,
          user_id: this.options.userId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording cache hit:', error);
    }
  }
  
  /**
   * Limpa itens de cache expirados
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const minTimestamp = new Date(Date.now() - this.options.maxCacheAge).toISOString();
      
      const { data, error } = await this.supabase
        .from('llm_response_cache')
        .delete()
        .lt('created_at', minTimestamp)
        .select('id');
      
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
      return 0;
    }
  }
  
  /**
   * Invalida itens de cache específicos
   */
  async invalidateCacheItems(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    
    try {
      await this.supabase
        .from('llm_response_cache')
        .delete()
        .in('id', ids);
    } catch (error) {
      console.error('Error invalidating cache items:', error);
    }
  }
  
  /**
   * Obtém estatísticas de uso do cache
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    totalHits: number;
    hitRate: number;
    averageTokensSaved: number;
  }> {
    try {
      // Obter contagem total de itens
      const { count: totalItems, error: countError } = await this.supabase
        .from('llm_response_cache')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Obter contagem total de hits
      const { count: totalHits, error: hitsError } = await this.supabase
        .from('llm_cache_metrics')
        .select('*', { count: 'exact', head: true });
      
      if (hitsError) throw hitsError;
      
      // Calcular tokens economizados
      const { data: tokenData, error: tokenError } = await this.supabase
        .from('llm_cache_metrics')
        .select('llm_response_cache!inner(tokens_used)')
        .limit(1000); // Limitar para performance
      
      if (tokenError) throw tokenError;
      
      const totalTokensSaved = tokenData.reduce((sum, item) => {
        return sum + (item.llm_response_cache?.tokens_used || 0);
      }, 0);
      
      const averageTokensSaved = tokenData.length > 0 ? 
        totalTokensSaved / tokenData.length : 0;
      
      return {
        totalItems: totalItems || 0,
        totalHits: totalHits || 0,
        hitRate: totalItems > 0 ? totalHits / totalItems : 0,
        averageTokensSaved
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalItems: 0,
        totalHits: 0,
        hitRate: 0,
        averageTokensSaved: 0
      };
    }
  }
}

export default SemanticCache;

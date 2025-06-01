/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Schema SQL para cache semântico de respostas LLM no Supabase
 * Implementa armazenamento e recuperação eficiente baseado em similaridade semântica
 */

-- Habilitar a extensão de vetores para suporte a embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela para armazenar cache de respostas LLM com embeddings
CREATE TABLE llm_response_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Conteúdo da pergunta e resposta
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- Embedding vetorial da pergunta para busca por similaridade
  embedding VECTOR(1536) NOT NULL,
  
  -- Metadados da resposta
  task_type TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  
  -- Informações do usuário e timestamp
  user_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por similaridade de cosseno
CREATE INDEX idx_llm_response_cache_embedding ON llm_response_cache 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índices para consultas frequentes
CREATE INDEX idx_llm_response_cache_user ON llm_response_cache(user_id);
CREATE INDEX idx_llm_response_cache_task ON llm_response_cache(task_type);
CREATE INDEX idx_llm_response_cache_model ON llm_response_cache(model_name);
CREATE INDEX idx_llm_response_cache_created ON llm_response_cache(created_at);

-- Tabela para métricas de uso do cache
CREATE TABLE llm_cache_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Referência ao item de cache
  cache_item_id UUID NOT NULL REFERENCES llm_response_cache(id) ON DELETE CASCADE,
  
  -- Informações do usuário e timestamp
  user_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para métricas
CREATE INDEX idx_llm_cache_metrics_item ON llm_cache_metrics(cache_item_id);
CREATE INDEX idx_llm_cache_metrics_user ON llm_cache_metrics(user_id);
CREATE INDEX idx_llm_cache_metrics_timestamp ON llm_cache_metrics(timestamp);

-- Função para buscar embeddings similares
CREATE OR REPLACE FUNCTION match_question_embeddings(
  query_embedding VECTOR(1536),
  similarity_threshold FLOAT,
  match_count INT,
  min_created_at TIMESTAMP WITH TIME ZONE,
  task_type TEXT
)
RETURNS TABLE (
  id UUID,
  question TEXT,
  answer TEXT,
  similarity FLOAT,
  model_name TEXT,
  provider TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.question,
    c.answer,
    1 - (c.embedding <=> query_embedding) as similarity,
    c.model_name,
    c.provider
  FROM llm_response_cache c
  WHERE c.created_at >= min_created_at
    AND c.task_type = task_type
    AND 1 - (c.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

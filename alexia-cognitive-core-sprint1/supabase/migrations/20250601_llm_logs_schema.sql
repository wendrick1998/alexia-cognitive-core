/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Schema SQL para logs inteligentes do sistema multi-LLM no Supabase
 * Implementa armazenamento e análise de métricas por modelo, incluindo tempo, custo e fallback
 */

-- Tabela para armazenar logs detalhados de chamadas LLM
CREATE TABLE llm_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação do usuário e sessão
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  
  -- Informações do modelo
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  task_type TEXT NOT NULL,
  
  -- Detalhes da chamada
  question TEXT NOT NULL,
  answer_length INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  response_time FLOAT NOT NULL, -- em milissegundos
  
  -- Métricas de tokens e custo
  tokens_input INTEGER NOT NULL,
  tokens_output INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  estimated_cost FLOAT NOT NULL,
  
  -- Informações de fallback
  used_fallback BOOLEAN DEFAULT FALSE,
  fallback_reason TEXT,
  fallback_model TEXT,
  
  -- Informações de cache
  cache_hit BOOLEAN DEFAULT FALSE,
  
  -- Status e erro
  status TEXT CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp de criação
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas frequentes
CREATE INDEX idx_llm_call_logs_user ON llm_call_logs(user_id);
CREATE INDEX idx_llm_call_logs_model ON llm_call_logs(model_name);
CREATE INDEX idx_llm_call_logs_provider ON llm_call_logs(provider);
CREATE INDEX idx_llm_call_logs_task ON llm_call_logs(task_type);
CREATE INDEX idx_llm_call_logs_time ON llm_call_logs(start_time);
CREATE INDEX idx_llm_call_logs_status ON llm_call_logs(status);
CREATE INDEX idx_llm_call_logs_fallback ON llm_call_logs(used_fallback);
CREATE INDEX idx_llm_call_logs_cache ON llm_call_logs(cache_hit);

-- Tabela para armazenar métricas agregadas por modelo
CREATE TABLE llm_model_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação do modelo
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  
  -- Período de agregação
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Métricas agregadas
  total_calls INTEGER NOT NULL,
  successful_calls INTEGER NOT NULL,
  failed_calls INTEGER NOT NULL,
  timeout_calls INTEGER NOT NULL,
  
  -- Métricas de tempo
  avg_response_time FLOAT NOT NULL,
  p50_response_time FLOAT NOT NULL,
  p95_response_time FLOAT NOT NULL,
  p99_response_time FLOAT NOT NULL,
  
  -- Métricas de tokens e custo
  total_tokens_used INTEGER NOT NULL,
  avg_tokens_per_call FLOAT NOT NULL,
  total_cost FLOAT NOT NULL,
  
  -- Métricas de fallback
  fallback_count INTEGER NOT NULL,
  fallback_rate FLOAT NOT NULL,
  
  -- Métricas de cache
  cache_hit_count INTEGER NOT NULL,
  cache_hit_rate FLOAT NOT NULL,
  
  -- Timestamp de criação
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restrição de unicidade para modelo + período
  UNIQUE(model_name, period_start, period_end)
);

-- Índices para métricas
CREATE INDEX idx_llm_model_metrics_model ON llm_model_metrics(model_name);
CREATE INDEX idx_llm_model_metrics_provider ON llm_model_metrics(provider);
CREATE INDEX idx_llm_model_metrics_period ON llm_model_metrics(period_start, period_end);

-- Função para calcular métricas agregadas diárias
CREATE OR REPLACE FUNCTION calculate_daily_llm_metrics()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  yesterday_start TIMESTAMP WITH TIME ZONE;
  yesterday_end TIMESTAMP WITH TIME ZONE;
  model_record RECORD;
BEGIN
  -- Definir período (ontem)
  yesterday_start := date_trunc('day', NOW() - INTERVAL '1 day');
  yesterday_end := date_trunc('day', NOW());
  
  -- Para cada modelo com chamadas no período
  FOR model_record IN 
    SELECT DISTINCT model_name, provider 
    FROM llm_call_logs 
    WHERE start_time >= yesterday_start AND start_time < yesterday_end
  LOOP
    -- Inserir ou atualizar métricas agregadas
    INSERT INTO llm_model_metrics (
      model_name,
      provider,
      period_start,
      period_end,
      total_calls,
      successful_calls,
      failed_calls,
      timeout_calls,
      avg_response_time,
      p50_response_time,
      p95_response_time,
      p99_response_time,
      total_tokens_used,
      avg_tokens_per_call,
      total_cost,
      fallback_count,
      fallback_rate,
      cache_hit_count,
      cache_hit_rate
    )
    SELECT
      model_record.model_name,
      model_record.provider,
      yesterday_start,
      yesterday_end,
      COUNT(*),
      COUNT(*) FILTER (WHERE status = 'success'),
      COUNT(*) FILTER (WHERE status = 'error'),
      COUNT(*) FILTER (WHERE status = 'timeout'),
      AVG(response_time),
      percentile_cont(0.5) WITHIN GROUP (ORDER BY response_time),
      percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time),
      percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time),
      SUM(total_tokens),
      AVG(total_tokens),
      SUM(estimated_cost),
      COUNT(*) FILTER (WHERE used_fallback = TRUE),
      COUNT(*) FILTER (WHERE used_fallback = TRUE)::FLOAT / COUNT(*)::FLOAT,
      COUNT(*) FILTER (WHERE cache_hit = TRUE),
      COUNT(*) FILTER (WHERE cache_hit = TRUE)::FLOAT / COUNT(*)::FLOAT
    FROM
      llm_call_logs
    WHERE
      model_name = model_record.model_name
      AND start_time >= yesterday_start
      AND start_time < yesterday_end
    ON CONFLICT (model_name, period_start, period_end)
    DO UPDATE SET
      total_calls = EXCLUDED.total_calls,
      successful_calls = EXCLUDED.successful_calls,
      failed_calls = EXCLUDED.failed_calls,
      timeout_calls = EXCLUDED.timeout_calls,
      avg_response_time = EXCLUDED.avg_response_time,
      p50_response_time = EXCLUDED.p50_response_time,
      p95_response_time = EXCLUDED.p95_response_time,
      p99_response_time = EXCLUDED.p99_response_time,
      total_tokens_used = EXCLUDED.total_tokens_used,
      avg_tokens_per_call = EXCLUDED.avg_tokens_per_call,
      total_cost = EXCLUDED.total_cost,
      fallback_count = EXCLUDED.fallback_count,
      fallback_rate = EXCLUDED.fallback_rate,
      cache_hit_count = EXCLUDED.cache_hit_count,
      cache_hit_rate = EXCLUDED.cache_hit_rate;
  END LOOP;
END;
$$;

-- Criar trigger para executar cálculo de métricas diariamente
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'calculate-daily-llm-metrics',
  '0 1 * * *', -- Executar às 01:00 todos os dias
  $$SELECT calculate_daily_llm_metrics()$$
);

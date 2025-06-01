/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Schema SQL para tabela de feedback do sistema multi-LLM no Supabase
 * Armazena feedback do usuário e contexto completo para análise e aprendizado
 */

-- Tabela para armazenar feedback do usuário sobre respostas LLM
CREATE TABLE llm_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Feedback do usuário
  rating TEXT CHECK (rating IN ('positive', 'negative')),
  score SMALLINT CHECK (score >= 1 AND score <= 5),
  
  -- Contexto da pergunta e resposta
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  
  -- Informações do modelo
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  used_fallback BOOLEAN DEFAULT FALSE,
  
  -- Métricas de performance
  response_time FLOAT NOT NULL, -- em milissegundos
  tokens_used INTEGER NOT NULL,
  
  -- Metadados
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Campos para processamento em batch
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Índices para consultas frequentes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimizar consultas
CREATE INDEX idx_llm_feedback_model ON llm_feedback(model_name);
CREATE INDEX idx_llm_feedback_provider ON llm_feedback(provider);
CREATE INDEX idx_llm_feedback_user ON llm_feedback(user_id);
CREATE INDEX idx_llm_feedback_processed ON llm_feedback(processed);
CREATE INDEX idx_llm_feedback_timestamp ON llm_feedback(timestamp);

-- Tabela para armazenar configurações de preferência do orquestrador
CREATE TABLE llm_orchestrator_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  user_id TEXT NOT NULL,
  
  -- Preferências por tipo de tarefa
  task_type TEXT NOT NULL,
  preferred_model TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 0.5,
  
  -- Metadados
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restrição de unicidade para user_id + task_type
  UNIQUE(user_id, task_type)
);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_llm_orchestrator_preferences_updated_at
BEFORE UPDATE ON llm_orchestrator_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Tabela para armazenar estatísticas de processamento em batch
CREATE TABLE llm_feedback_batch_processing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações do processamento
  batch_size INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('started', 'completed', 'failed')),
  
  -- Resultados
  preferences_updated INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

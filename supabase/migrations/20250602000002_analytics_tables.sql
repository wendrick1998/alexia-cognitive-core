
/**
 * Analytics Tables Migration - Alex iA
 * Created: 2025-06-02
 * Description: Creates tables for LLM feedback, call logs, and semantic caching
 */

-- Create LLM feedback table
CREATE TABLE IF NOT EXISTS public.llm_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('positive', 'negative', 'neutral')),
  score INTEGER CHECK (score >= 1 AND score <= 5),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  used_fallback BOOLEAN DEFAULT FALSE,
  response_time INTEGER, -- in milliseconds
  tokens_used INTEGER DEFAULT 0,
  feedback_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LLM call logs table
CREATE TABLE IF NOT EXISTS public.llm_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  task_type TEXT NOT NULL DEFAULT 'chat',
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  response_time INTEGER, -- in milliseconds
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  cost_estimate DECIMAL(10, 6), -- estimated cost in USD
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create LLM response cache table (from semantic cache schema)
CREATE TABLE IF NOT EXISTS public.llm_response_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  task_type TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cache metrics table
CREATE TABLE IF NOT EXISTS public.llm_cache_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_item_id UUID NOT NULL REFERENCES public.llm_response_cache(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.llm_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_response_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_cache_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for llm_feedback
CREATE POLICY "Users can view their own feedback" ON public.llm_feedback
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own feedback" ON public.llm_feedback
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own feedback" ON public.llm_feedback
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own feedback" ON public.llm_feedback
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create RLS policies for llm_call_logs
CREATE POLICY "Users can view their own call logs" ON public.llm_call_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own call logs" ON public.llm_call_logs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create RLS policies for llm_response_cache
CREATE POLICY "Users can view their own cached responses" ON public.llm_response_cache
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own cached responses" ON public.llm_response_cache
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create RLS policies for llm_cache_metrics
CREATE POLICY "Users can view their own cache metrics" ON public.llm_cache_metrics
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own cache metrics" ON public.llm_cache_metrics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_llm_feedback_user_id ON public.llm_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_feedback_rating ON public.llm_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_llm_feedback_created_at ON public.llm_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_llm_call_logs_user_id ON public.llm_call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_call_logs_model_name ON public.llm_call_logs(model_name);
CREATE INDEX IF NOT EXISTS idx_llm_call_logs_created_at ON public.llm_call_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_llm_response_cache_embedding ON public.llm_response_cache 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_llm_response_cache_user ON public.llm_response_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_response_cache_task ON public.llm_response_cache(task_type);

CREATE INDEX IF NOT EXISTS idx_llm_cache_metrics_item ON public.llm_cache_metrics(cache_item_id);
CREATE INDEX IF NOT EXISTS idx_llm_cache_metrics_user ON public.llm_cache_metrics(user_id);

-- Create function for semantic similarity search
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
  FROM public.llm_response_cache c
  WHERE c.created_at >= min_created_at
    AND c.task_type = match_question_embeddings.task_type
    AND 1 - (c.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

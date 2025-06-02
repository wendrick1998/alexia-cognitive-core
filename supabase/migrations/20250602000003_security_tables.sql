
/**
 * Security Tables Migration - Alex iA
 * Created: 2025-06-02
 * Description: Creates security events table and adds missing RLS policies
 */

-- Create security events table for audit logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security_events (only admins can view all, users can view their own)
CREATE POLICY "Users can view their own security events" ON public.security_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- Add missing RLS policies for cognitive_clusters
ALTER TABLE public.cognitive_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cognitive clusters" ON public.cognitive_clusters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cognitive clusters" ON public.cognitive_clusters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cognitive clusters" ON public.cognitive_clusters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cognitive clusters" ON public.cognitive_clusters
  FOR DELETE USING (auth.uid() = user_id);

-- Add missing RLS policies for llm_response_cache
ALTER TABLE public.llm_response_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cached responses" ON public.llm_response_cache
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own cached responses" ON public.llm_response_cache
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Add indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_action ON public.security_events(action);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

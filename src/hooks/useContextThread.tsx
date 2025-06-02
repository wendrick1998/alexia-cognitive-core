
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ContextNode {
  node_id: string;
  content: string;
  title: string;
  node_type: string;
  created_at: string;
  relevance_score: number;
  is_sensitive: boolean;
  global_confidence: number;
  context_position: number;
}

export function useContextThread() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getContextThread = useCallback(async (
    projectId?: string,
    conversationId?: string,
    limit: number = 50
  ): Promise<ContextNode[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_context_thread', {
        p_project_id: projectId || null,
        p_conversation_id: conversationId || null,
        p_user_id: user.id,
        p_limit: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar thread de contexto:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getProjectContext = useCallback(async (projectId: string, limit: number = 30): Promise<ContextNode[]> => {
    return getContextThread(projectId, undefined, limit);
  }, [getContextThread]);

  const getConversationContext = useCallback(async (conversationId: string, limit: number = 50): Promise<ContextNode[]> => {
    return getContextThread(undefined, conversationId, limit);
  }, [getContextThread]);

  const getRecentContext = useCallback(async (limit: number = 20): Promise<ContextNode[]> => {
    return getContextThread(undefined, undefined, limit);
  }, [getContextThread]);

  const getHighConfidenceContext = useCallback(async (
    projectId?: string,
    conversationId?: string,
    minConfidence: number = 0.7
  ): Promise<ContextNode[]> => {
    const context = await getContextThread(projectId, conversationId, 100);
    return context.filter(node => node.global_confidence >= minConfidence);
  }, [getContextThread]);

  const getSensitiveContext = useCallback(async (
    projectId?: string,
    conversationId?: string
  ): Promise<ContextNode[]> => {
    const context = await getContextThread(projectId, conversationId, 100);
    return context.filter(node => node.is_sensitive);
  }, [getContextThread]);

  return {
    loading,
    getContextThread,
    getProjectContext,
    getConversationContext,
    getRecentContext,
    getHighConfidenceContext,
    getSensitiveContext
  };
}

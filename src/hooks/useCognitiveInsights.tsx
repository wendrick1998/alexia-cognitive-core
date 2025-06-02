
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CognitiveInsight {
  id: string;
  user_id: string;
  title: string;
  content: string;
  insight_type: string;
  priority_level: number;
  confidence_score: number;
  status: string;
  created_at: string;
  shown_at?: string;
  acted_upon_at?: string;
  metadata: any;
  related_nodes: any;
}

export function useCognitiveInsights() {
  const [insights, setInsights] = useState<CognitiveInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadInsights = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cognitive_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const markAsRead = useCallback(async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('cognitive_insights')
        .update({
          shown_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', insightId);

      if (error) throw error;
      await loadInsights();
    } catch (error) {
      console.error('Erro ao marcar insight como lido:', error);
    }
  }, [loadInsights]);

  const markAsActedUpon = useCallback(async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('cognitive_insights')
        .update({
          acted_upon_at: new Date().toISOString(),
          status: 'acted_upon'
        })
        .eq('id', insightId);

      if (error) throw error;
      await loadInsights();
      
      toast({
        title: "Ação Registrada",
        description: "Insight marcado como implementado",
      });
    } catch (error) {
      console.error('Erro ao marcar insight como implementado:', error);
    }
  }, [loadInsights, toast]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights,
    loading,
    loadInsights,
    markAsRead,
    markAsActedUpon
  };
}

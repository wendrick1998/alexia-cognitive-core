
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MemoryFeedback {
  id: string;
  memory_id: string;
  user_id: string;
  confidence_level: 'confirmado' | 'provavel' | 'incerto' | 'rejeitado';
  feedback_text?: string;
  created_at: string;
}

export interface FeedbackSummary {
  confidence_level: string;
  count: number;
}

export function useMemoryFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const submitFeedback = useCallback(async (
    memoryId: string,
    confidenceLevel: MemoryFeedback['confidence_level'],
    feedbackText?: string
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('memory_feedback')
        .insert({
          memory_id: memoryId,
          user_id: user.id,
          confidence_level: confidenceLevel,
          feedback_text: feedbackText
        });

      if (error) throw error;

      toast({
        title: "Feedback enviado",
        description: `Memória marcada como "${confidenceLevel}"`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getFeedbackSummary = useCallback(async (memoryId: string): Promise<FeedbackSummary[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_memory_feedback_summary', { memory_id_param: memoryId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar resumo de feedback:', error);
      return [];
    }
  }, []);

  const getMemoryFeedback = useCallback(async (memoryId: string): Promise<MemoryFeedback[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('memory_feedback')
        .select('*')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Garantir que confidence_level está no tipo correto
      return (data || []).map(item => ({
        ...item,
        confidence_level: item.confidence_level as MemoryFeedback['confidence_level']
      }));
    } catch (error) {
      console.error('Erro ao buscar feedback:', error);
      return [];
    }
  }, [user]);

  const updateFeedback = useCallback(async (
    feedbackId: string,
    confidenceLevel: MemoryFeedback['confidence_level'],
    feedbackText?: string
  ): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('memory_feedback')
        .update({
          confidence_level: confidenceLevel,
          feedback_text: feedbackText
        })
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: "Feedback atualizado",
        description: "Alterações salvas com sucesso",
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar feedback:', error);
      toast({
        title: "Erro ao atualizar feedback",
        description: "Tente novamente",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    loading,
    submitFeedback,
    getFeedbackSummary,
    getMemoryFeedback,
    updateFeedback
  };
}


import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MemoryValidation {
  memory_id: string;
  status: 'validated' | 'error';
  version_count: number;
  inconsistency_count: number;
  global_confidence: number;
  is_sensitive: boolean;
  validation_status: 'reliable' | 'unreliable' | 'needs_review';
  recommendations: string[];
}

export interface MemoryInconsistency {
  id: string;
  current_content: string;
  version_number: number;
  version_content: string;
  title: string;
  updated_at: string;
  version_created_at: string;
  content_similarity_score: number;
}

export interface ValidationLog {
  id: string;
  memory_id: string;
  validation_type: string;
  validation_result: string;
  confidence_score: number;
  details: any;
  created_at: string;
}

export function useMemoryValidation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const validateMemoryConsistency = useCallback(async (memoryId: string): Promise<MemoryValidation | null> => {
    if (!user || !memoryId) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('validate_memory_consistency', {
        p_memory_id: memoryId
      });

      if (error) throw error;

      // Safely extract and cast the data
      const result = data as any;
      
      if (!result) {
        throw new Error('No data returned from validation');
      }

      // Create properly typed MemoryValidation object
      const validationResult: MemoryValidation = {
        memory_id: result.memory_id,
        status: result.status === 'error' ? 'error' : 'validated',
        version_count: Number(result.version_count) || 0,
        inconsistency_count: Number(result.inconsistency_count) || 0,
        global_confidence: Number(result.global_confidence) || 0,
        is_sensitive: Boolean(result.is_sensitive),
        validation_status: result.validation_status || 'needs_review',
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
      };

      toast({
        title: "Validação Concluída",
        description: `Memória validada com status: ${validationResult.validation_status}`,
      });

      return validationResult;
    } catch (error) {
      console.error('Erro ao validar consistência:', error);
      toast({
        title: "Erro na Validação",
        description: "Não foi possível validar a consistência da memória",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getMemoryInconsistencies = useCallback(async (): Promise<MemoryInconsistency[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('memory_inconsistencies')
        .select('*')
        .order('content_similarity_score', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar inconsistências:', error);
      return [];
    }
  }, [user]);

  const getValidationLogs = useCallback(async (memoryId?: string): Promise<ValidationLog[]> => {
    if (!user) return [];

    try {
      let query = supabase
        .from('memory_validation_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (memoryId) {
        query = query.eq('memory_id', memoryId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs de validação:', error);
      return [];
    }
  }, [user]);

  const markMemorySensitive = useCallback(async (memoryId: string, isSensitive: boolean = true): Promise<boolean> => {
    if (!user || !memoryId) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('mark_memory_sensitive', {
        p_memory_id: memoryId,
        p_is_sensitive: isSensitive
      });

      if (error) throw error;

      toast({
        title: isSensitive ? "Memória Marcada como Sensível" : "Memória Desmarcada como Sensível",
        description: `Status de sensibilidade atualizado com sucesso`,
      });

      return Boolean(data);
    } catch (error) {
      console.error('Erro ao marcar sensibilidade:', error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar o status de sensibilidade",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getMemoryConfidenceScores = useCallback(async (): Promise<any[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('memory_confidence_score')
        .select('*')
        .order('global_confidence_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar scores de confiança:', error);
      return [];
    }
  }, [user]);

  return {
    loading,
    validateMemoryConsistency,
    getMemoryInconsistencies,
    getValidationLogs,
    markMemorySensitive,
    getMemoryConfidenceScores
  };
}


import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface CognitiveMemory {
  id: string;
  user_id?: string;
  source: string;
  content: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface CreateCognitiveMemoryData {
  content: string;
  source: string;
  metadata?: Record<string, any>;
  is_global?: boolean;
}

export function useCognitiveMemories() {
  const [memories, setMemories] = useState<CognitiveMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMemories = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('memory_embeddings')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cognitive memories:', error);
        toast({
          title: "Erro ao carregar memórias",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setMemories(data || []);
    } catch (error) {
      console.error('Error in fetchMemories:', error);
      toast({
        title: "Erro ao carregar memórias",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMemory = async (memoryData: CreateCognitiveMemoryData) => {
    if (!user) return false;

    try {
      // Generate embedding for the content
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: { text: memoryData.content }
      });

      if (embeddingError) {
        console.error('Error generating embedding:', embeddingError);
        toast({
          title: "Erro ao processar memória",
          description: "Falha ao gerar embedding para a memória",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from('memory_embeddings')
        .insert({
          content: memoryData.content,
          source: memoryData.source,
          user_id: memoryData.is_global ? null : user.id,
          metadata: memoryData.metadata || {},
          embedding: JSON.stringify(embeddingData.embedding)
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating cognitive memory:', error);
        toast({
          title: "Erro ao criar memória",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setMemories(prev => [data, ...prev]);
      toast({
        title: "Memória criada com sucesso",
        description: `Memória ${memoryData.is_global ? 'global' : 'pessoal'} foi salva.`,
      });
      return true;
    } catch (error) {
      console.error('Error in createMemory:', error);
      toast({
        title: "Erro ao criar memória",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    memories,
    loading,
    createMemory,
    fetchMemories,
  };
}

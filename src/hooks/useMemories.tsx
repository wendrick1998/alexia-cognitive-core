
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Memory {
  id: string;
  user_id: string;
  project_id?: string;
  type: 'fact' | 'preference' | 'decision' | 'note';
  content: string;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
  };
}

export interface CreateMemoryData {
  content: string;
  type: 'fact' | 'preference' | 'decision' | 'note';
  project_id?: string;
}

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMemories = async (filters?: { type?: string; project_id?: string }) => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('memories')
        .select(`
          *,
          project:projects(name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.project_id) {
        if (filters.project_id === 'none') {
          query = query.is('project_id', null);
        } else {
          query = query.eq('project_id', filters.project_id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching memories:', error);
        toast({
          title: "Erro ao carregar memórias",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Type assertion to ensure correct typing
      const typedMemories = (data || []).map(memory => ({
        ...memory,
        type: memory.type as 'fact' | 'preference' | 'decision' | 'note'
      })) as Memory[];

      setMemories(typedMemories);
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

  const createMemory = async (memoryData: CreateMemoryData) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('memories')
        .insert({
          ...memoryData,
          user_id: user.id,
          project_id: memoryData.project_id || null,
        })
        .select(`
          *,
          project:projects(name)
        `)
        .single();

      if (error) {
        console.error('Error creating memory:', error);
        toast({
          title: "Erro ao criar memória",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Type assertion for the new memory
      const typedMemory = {
        ...data,
        type: data.type as 'fact' | 'preference' | 'decision' | 'note'
      } as Memory;

      setMemories(prev => [typedMemory, ...prev]);
      toast({
        title: "Memória criada com sucesso",
        description: `A memória foi salva.`,
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

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  return {
    memories,
    loading,
    createMemory,
    fetchMemories,
  };
}

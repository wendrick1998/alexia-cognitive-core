
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CognitiveNode {
  id: string;
  user_id: string;
  title: string;
  content: string;
  node_type: string;
  activation_strength: number;
  relevance_score: number;
  created_at: string;
  last_accessed_at: string;
  access_count: number;
  memory_type: string;
  status: string;
}

export function useCognitiveNodes() {
  const [nodes, setNodes] = useState<CognitiveNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadNodes = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      setNodes(data || []);
    } catch (error) {
      console.error('Erro ao carregar nós cognitivos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os nós cognitivos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const activateNode = useCallback(async (nodeId: string) => {
    try {
      const { error } = await supabase
        .from('cognitive_nodes')
        .update({
          activation_strength: 1.0,
          last_accessed_at: new Date().toISOString(),
          access_count: supabase.raw('access_count + 1')
        })
        .eq('id', nodeId);

      if (error) throw error;
      
      await loadNodes();
      
      toast({
        title: "Nó Ativado",
        description: "Nó cognitivo ativado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao ativar nó:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar o nó",
        variant: "destructive",
      });
    }
  }, [loadNodes, toast]);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  return {
    nodes,
    loading,
    loadNodes,
    activateNode
  };
}

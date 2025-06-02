
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CortexLog {
  id: string;
  user_id: string;
  session_id?: string;
  user_request: string;
  selected_model: string;
  reasoning?: string;
  response_stored_in?: string;
  insights_generated: any;
  activated_nodes: any;
  created_at: string;
  execution_time_ms: number;
  fallback_used: boolean;
  fallback_reason?: string;
}

export function useCortexLogs() {
  const [logs, setLogs] = useState<CortexLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadLogs = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cortex_decision_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = data?.map(item => ({
        ...item,
        insights_generated: item.insights_generated || [],
        activated_nodes: item.activated_nodes || []
      })) || [];
      
      setLogs(transformedData);
    } catch (error) {
      console.error('Erro ao carregar logs do córtex:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs do córtex",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const clearLogs = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cortex_decision_logs')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadLogs();
      
      toast({
        title: "Logs Limpos",
        description: "Todos os logs foram removidos",
      });
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar os logs",
        variant: "destructive",
      });
    }
  }, [user, loadLogs, toast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return {
    logs,
    loading,
    loadLogs,
    clearLogs
  };
}

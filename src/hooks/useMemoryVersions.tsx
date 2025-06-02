
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MemoryVersion {
  id: string;
  memory_id: string;
  version_number: number;
  content: string;
  created_at: string;
  created_by: string;
}

export function useMemoryVersions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createVersion = useCallback(async (
    memoryId: string,
    content: string
  ): Promise<string | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('create_memory_version', {
          p_memory_id: memoryId,
          p_content: content,
          p_user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Nova versão criada",
        description: "Memória atualizada com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar versão:', error);
      toast({
        title: "Erro ao criar versão",
        description: "Tente novamente",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getVersionHistory = useCallback(async (memoryId: string): Promise<MemoryVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('memory_versions')
        .select('*')
        .eq('memory_id', memoryId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }, []);

  const compareVersions = useCallback((version1: MemoryVersion, version2: MemoryVersion) => {
    return {
      version1,
      version2,
      diff: {
        added: version2.content.length - version1.content.length,
        changes: version1.content !== version2.content
      }
    };
  }, []);

  return {
    loading,
    createVersion,
    getVersionHistory,
    compareVersions
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Erro ao carregar projetos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      toast({
        title: "Erro ao carregar projetos",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description?: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: "Erro ao criar projeto",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setProjects(prev => [data, ...prev]);
      toast({
        title: "Projeto criado com sucesso",
        description: `O projeto "${name}" foi criado.`,
      });
      return true;
    } catch (error) {
      console.error('Error in createProject:', error);
      toast({
        title: "Erro ao criar projeto",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    loading,
    createProject,
    refetchProjects: fetchProjects,
  };
}

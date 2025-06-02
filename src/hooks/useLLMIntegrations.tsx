
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LLMIntegration {
  id: string;
  user_id: string;
  name: string;
  base_url: string;
  api_key: string;
  model: string;
  fallback_priority: number;
  temperature: number;
  max_tokens: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_tested_at?: string;
  test_status: string;
  avg_response_time: number;
  custom_headers: any;
  endpoint_path: string;
}

export function useLLMIntegrations() {
  const [integrations, setIntegrations] = useState<LLMIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadIntegrations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('llm_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('fallback_priority', { ascending: true });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as integrações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createIntegration = useCallback(async (integration: Omit<LLMIntegration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('llm_integrations')
        .insert({
          ...integration,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadIntegrations();
      
      toast({
        title: "Integração Criada",
        description: `${integration.name} foi adicionada com sucesso`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar integração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a integração",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast, loadIntegrations]);

  const testIntegration = useCallback(async (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return false;

      const startTime = Date.now();
      
      // Simular teste de integração
      const testPayload = {
        model: integration.model,
        messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
        max_tokens: 50,
        temperature: integration.temperature
      };

      const response = await fetch(integration.base_url + integration.endpoint_path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${integration.api_key}`,
          ...integration.custom_headers
        },
        body: JSON.stringify(testPayload)
      });

      const responseTime = Date.now() - startTime;
      const success = response.ok;

      await supabase
        .from('llm_integrations')
        .update({
          last_tested_at: new Date().toISOString(),
          test_status: success ? 'success' : 'failed',
          avg_response_time: responseTime
        })
        .eq('id', integrationId);

      await loadIntegrations();

      toast({
        title: success ? "Teste Bem-sucedido" : "Teste Falhou",
        description: success 
          ? `${integration.name} respondeu em ${responseTime}ms`
          : "Falha na conexão com a API",
        variant: success ? "default" : "destructive"
      });

      return success;
    } catch (error) {
      console.error('Erro ao testar integração:', error);
      
      await supabase
        .from('llm_integrations')
        .update({
          last_tested_at: new Date().toISOString(),
          test_status: 'failed'
        })
        .eq('id', integrationId);

      await loadIntegrations();

      toast({
        title: "Erro no Teste",
        description: "Não foi possível testar a integração",
        variant: "destructive",
      });

      return false;
    }
  }, [integrations, loadIntegrations, toast]);

  const toggleIntegration = useCallback(async (integrationId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('llm_integrations')
        .update({ active })
        .eq('id', integrationId);

      if (error) throw error;
      
      await loadIntegrations();
      
      toast({
        title: active ? "Integração Ativada" : "Integração Desativada",
        description: "Status atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao alterar status da integração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive",
      });
    }
  }, [loadIntegrations, toast]);

  const deleteIntegration = useCallback(async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('llm_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;
      
      await loadIntegrations();
      
      toast({
        title: "Integração Removida",
        description: "Integração removida com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover integração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a integração",
        variant: "destructive",
      });
    }
  }, [loadIntegrations, toast]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  return {
    integrations,
    loading,
    loadIntegrations,
    createIntegration,
    testIntegration,
    toggleIntegration,
    deleteIntegration
  };
}

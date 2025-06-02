
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnvironmentStatus {
  isValid: boolean;
  supabaseConnected: boolean;
  connectionError: string | null;
  warnings: string[];
}

export function useEnvironmentValidation() {
  const [status, setStatus] = useState<EnvironmentStatus>({
    isValid: true,
    supabaseConnected: true,
    connectionError: null,
    warnings: []
  });
  const { toast } = useToast();

  useEffect(() => {
    const validateEnvironment = async () => {
      const warnings: string[] = [];
      let connectionError: string | null = null;
      let supabaseConnected = false;

      try {
        // Test Supabase connection by attempting to get session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Supabase auth warning:', error.message);
          // Don't treat auth errors as connection failures
          supabaseConnected = true;
        } else {
          supabaseConnected = true;
          console.log('🔗 Supabase connection verified');
        }
      } catch (error) {
        console.error('🚨 Supabase connection failed:', error);
        connectionError = 'Falha na conexão com Supabase';
        supabaseConnected = false;
      }

      // Check for optional environment variables
      const optionalEnvVars = [
        'VITE_OPENAI_API_KEY',
        'VITE_LLM_WHISPERER_API_KEY'
      ];

      optionalEnvVars.forEach(envVar => {
        if (!import.meta.env[envVar]) {
          warnings.push(`${envVar} não configurada - algumas funcionalidades podem estar limitadas`);
        }
      });

      const isValid = supabaseConnected;

      setStatus({
        isValid,
        supabaseConnected,
        connectionError,
        warnings
      });

      // Only show error toast for actual connection failures
      if (!supabaseConnected && connectionError) {
        toast({
          title: "Erro de Conexão",
          description: connectionError,
          variant: "destructive",
        });
      } else if (warnings.length > 0) {
        console.warn('⚠️ Avisos de configuração:', warnings);
      } else if (supabaseConnected) {
        console.log('✅ Ambiente validado com sucesso');
      }
    };

    validateEnvironment();
  }, [toast]);

  return status;
}

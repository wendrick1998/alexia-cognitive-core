
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface EnvironmentStatus {
  isValid: boolean;
  missingSecrets: string[];
  supabaseConnected: boolean;
  warnings: string[];
}

export function useEnvironmentValidation() {
  const [status, setStatus] = useState<EnvironmentStatus>({
    isValid: true,
    missingSecrets: [],
    supabaseConnected: true,
    warnings: []
  });
  const { toast } = useToast();

  useEffect(() => {
    const validateEnvironment = () => {
      const missingSecrets: string[] = [];
      const warnings: string[] = [];

      // Verificar se o Supabase está configurado
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const supabaseConnected = !!(supabaseUrl && supabaseKey);

      // Verificar variáveis críticas
      const requiredEnvVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
      ];

      requiredEnvVars.forEach(envVar => {
        if (!import.meta.env[envVar]) {
          missingSecrets.push(envVar);
        }
      });

      // Verificar variáveis opcionais mas recomendadas
      const optionalEnvVars = [
        'VITE_OPENAI_API_KEY',
        'VITE_LLM_WHISPERER_API_KEY'
      ];

      optionalEnvVars.forEach(envVar => {
        if (!import.meta.env[envVar]) {
          warnings.push(`${envVar} não configurada - algumas funcionalidades podem estar limitadas`);
        }
      });

      const isValid = missingSecrets.length === 0 && supabaseConnected;

      setStatus({
        isValid,
        missingSecrets,
        supabaseConnected,
        warnings
      });

      // Mostrar toast apenas se houver problemas críticos
      if (!isValid) {
        toast({
          title: "Configuração Incompleta",
          description: `Variáveis de ambiente faltando: ${missingSecrets.join(', ')}`,
          variant: "destructive",
        });
      } else if (warnings.length > 0) {
        console.warn('⚠️ Avisos de configuração:', warnings);
      }
    };

    validateEnvironment();
  }, [toast]);

  return status;
}

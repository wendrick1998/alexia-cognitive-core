
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface MemoryDecayConfig {
  workingMemoryThreshold: number; // horas
  shortTermThreshold: number; // dias
  longTermDecayRate: number; // taxa de decay por dia
  sensitiveMemoryProtection: boolean;
}

export function useAutoMemoryDecay() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDecayRun, setLastDecayRun] = useState<string | null>(null);
  
  const [config, setConfig] = useState<MemoryDecayConfig>({
    workingMemoryThreshold: 6, // 6 horas
    shortTermThreshold: 7, // 7 dias 
    longTermDecayRate: 0.02, // 2% por dia
    sensitiveMemoryProtection: true
  });

  // Aplicar decay de memória
  const applyMemoryDecay = useCallback(async () => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    try {
      console.log('🧠 Iniciando processo de decay de memória...');

      // 1. Mover memórias working antigas para short-term
      const workingThreshold = new Date(Date.now() - config.workingMemoryThreshold * 60 * 60 * 1000).toISOString();
      
      const { data: workingToShort, error: workingError } = await supabase
        .from('cognitive_nodes')
        .update({
          memory_type: 'short_term',
          consolidation_score: Math.min(1.0, 0.1), // Will be calculated properly in the database
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('memory_type', 'working')
        .lt('last_accessed_at', workingThreshold)
        .gt('activation_strength', 0.3) // Apenas memórias com alguma ativação
        .select();

      if (workingError) throw workingError;

      // 2. Mover memórias short-term antigas para long-term
      const shortTermThreshold = new Date(Date.now() - config.shortTermThreshold * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: shortToLong, error: shortError } = await supabase
        .from('cognitive_nodes')
        .update({
          memory_type: 'long_term',
          consolidation_score: Math.min(1.0, 0.2), // Will be calculated properly in the database
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('memory_type', 'short_term')
        .lt('last_accessed_at', shortTermThreshold)
        .gt('activation_strength', 0.5) // Threshold maior para long-term
        .select();

      if (shortError) throw shortError;

      // 3. Aplicar decay gradual para memórias long-term usando RPC function
      const { data: longTermDecay, error: decayError } = await supabase
        .rpc('apply_memory_decay', {
          p_user_id: user.id,
          p_decay_rate: config.longTermDecayRate,
          p_protect_sensitive: config.sensitiveMemoryProtection
        });

      if (decayError) throw decayError;

      // 4. Remover memórias muito antigas com baixa ativação
      const { data: removed, error: removeError } = await supabase
        .from('cognitive_nodes')
        .delete()
        .eq('user_id', user.id)
        .lt('activation_strength', 0.1)
        .lt('last_accessed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 dias
        .neq('is_sensitive', true) // Nunca remover dados sensíveis
        .neq('memory_type', 'long_term') // Nunca remover long-term
        .select();

      if (removeError) throw removeError;

      console.log('✅ Decay de memória aplicado:', {
        workingToShort: workingToShort?.length || 0,
        shortToLong: shortToLong?.length || 0,
        decayed: Array.isArray(longTermDecay) ? longTermDecay.length : 0,
        removed: removed?.length || 0
      });

      setLastDecayRun(new Date().toISOString());

    } catch (error) {
      console.error('❌ Erro no decay de memória:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [user, isProcessing, config]);

  // Configurar decay automático
  const updateConfig = useCallback((newConfig: Partial<MemoryDecayConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Executar decay manual
  const runDecayNow = useCallback(async () => {
    await applyMemoryDecay();
  }, [applyMemoryDecay]);

  // Obter estatísticas de memória
  const getMemoryStats = useCallback(async () => {
    if (!user) return null;

    try {
      // Contar por tipo de memória
      const { data: stats, error } = await supabase
        .from('cognitive_nodes')
        .select('memory_type, activation_strength')
        .eq('user_id', user.id);

      if (error) throw error;

      const byType = (stats || []).reduce((acc: any, node: any) => {
        if (!acc[node.memory_type]) acc[node.memory_type] = 0;
        acc[node.memory_type]++;
        return acc;
      }, {});

      const avgActivation = stats && stats.length > 0 
        ? stats.reduce((sum: number, node: any) => sum + (node.activation_strength || 0), 0) / stats.length
        : 0;

      return {
        total: stats?.length || 0,
        byType,
        avgActivation,
        lastDecayRun
      };
    } catch (error) {
      console.error('Erro ao obter stats:', error);
      return null;
    }
  }, [user, lastDecayRun]);

  // Configurar interval automático
  useEffect(() => {
    if (!user) return;

    // Executar decay a cada 2 horas
    const interval = setInterval(() => {
      applyMemoryDecay();
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, applyMemoryDecay]);

  return {
    config,
    isProcessing,
    lastDecayRun,
    updateConfig,
    runDecayNow,
    getMemoryStats
  };
}

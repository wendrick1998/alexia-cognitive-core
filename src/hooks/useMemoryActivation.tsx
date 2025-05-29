
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MemoryActivationStats {
  totalMemories: number;
  activeNodes: number;
  consolidationSessions: number;
  lastConsolidation: string | null;
  isConsolidating: boolean;
}

export function useMemoryActivation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<MemoryActivationStats>({
    totalMemories: 0,
    activeNodes: 0,
    consolidationSessions: 0,
    lastConsolidation: null,
    isConsolidating: false
  });

  // Memory decay function
  const applyMemoryDecay = useCallback(async () => {
    if (!user) return;

    try {
      const { data: memories, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      for (const memory of memories || []) {
        const hoursElapsed = (Date.now() - new Date(memory.updated_at).getTime()) / (1000 * 60 * 60);
        const decayFactor = Math.pow(0.95, hoursElapsed);
        const currentStrength = (memory.metadata as any)?.activation_strength || 1.0;
        const newStrength = Math.max(0.1, currentStrength * decayFactor);

        await supabase
          .from('memories')
          .update({
            metadata: {
              ...(memory.metadata as any),
              activation_strength: newStrength,
              last_decay: new Date().toISOString()
            }
          })
          .eq('id', memory.id);
      }

      console.log('🧠 Memory decay aplicado a', memories?.length || 0, 'memórias');
    } catch (error) {
      console.error('Erro no memory decay:', error);
    }
  }, [user]);

  // Boost memory activation
  const boostMemoryActivation = useCallback(async (memoryId: string) => {
    try {
      const { data: memory, error } = await supabase
        .from('memories')
        .select('*')
        .eq('id', memoryId)
        .single();

      if (error) throw error;

      const currentStrength = (memory.metadata as any)?.activation_strength || 0.5;
      const newStrength = Math.min(1.0, currentStrength + 0.2);

      await supabase
        .from('memories')
        .update({
          metadata: {
            ...(memory.metadata as any),
            activation_strength: newStrength,
            last_boost: new Date().toISOString(),
            access_count: ((memory.metadata as any)?.access_count || 0) + 1
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', memoryId);

      console.log('🚀 Memory boost aplicado:', memoryId, 'força:', newStrength);
    } catch (error) {
      console.error('Erro no memory boost:', error);
    }
  }, []);

  // Save interaction as memory
  const saveInteractionAsMemory = useCallback(async (
    content: string,
    type: 'fact' | 'preference' | 'decision' | 'note' = 'note',
    metadata: any = {}
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          type,
          content,
          metadata: {
            ...metadata,
            activation_strength: 1.0,
            created_from: 'interaction',
            importance_score: 0.8,
            last_boost: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) throw error;

      console.log('💾 Interação salva como memória:', data.id);
      await loadStats();
      return data;
    } catch (error) {
      console.error('Erro ao salvar interação:', error);
      return null;
    }
  }, [user]);

  // Memory consolidation
  const runMemoryConsolidation = useCallback(async () => {
    if (!user) return;

    setStats(prev => ({ ...prev, isConsolidating: true }));

    try {
      console.log('🔄 Iniciando consolidação de memória...');

      // 1. Move old messages to memories
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: oldMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .lt('created_at', oneHourAgo)
        .limit(50);

      if (messagesError) throw messagesError;

      for (const message of oldMessages || []) {
        if (message.role === 'user' && message.content.length > 20) {
          await saveInteractionAsMemory(
            message.content,
            'note',
            {
              source: 'consolidated_message',
              conversation_id: message.conversation_id,
              original_timestamp: message.created_at
            }
          );
        }
      }

      // 2. Create consolidation session record
      const { data: session, error: sessionError } = await supabase
        .from('memory_consolidation_sessions')
        .insert({
          user_id: user.id,
          session_type: 'automatic_hourly',
          messages_processed: oldMessages?.length || 0,
          memories_created: oldMessages?.filter(m => m.role === 'user' && m.content.length > 20).length || 0,
          insights_generated: 0,
          session_metadata: {
            trigger: 'hourly_consolidation',
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 3. Delete processed messages
      if (oldMessages && oldMessages.length > 0) {
        await supabase
          .from('messages')
          .delete()
          .in('id', oldMessages.map(m => m.id));
      }

      console.log('✅ Consolidação concluída:', {
        session: session.id,
        processed: oldMessages?.length || 0
      });

      toast({
        title: "Consolidação de Memória",
        description: `${oldMessages?.length || 0} mensagens processadas`,
      });

    } catch (error) {
      console.error('Erro na consolidação:', error);
      toast({
        title: "Erro na Consolidação",
        description: "Falha ao consolidar memórias",
        variant: "destructive",
      });
    } finally {
      setStats(prev => ({ ...prev, isConsolidating: false }));
      await loadStats();
    }
  }, [user, saveInteractionAsMemory, toast]);

  // Load memory stats
  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      // Count memories
      const { count: memoriesCount } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count cognitive nodes
      const { count: nodesCount } = await supabase
        .from('cognitive_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count consolidation sessions
      const { count: sessionsCount } = await supabase
        .from('memory_consolidation_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get last consolidation
      const { data: lastSession } = await supabase
        .from('memory_consolidation_sessions')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalMemories: memoriesCount || 0,
        activeNodes: nodesCount || 0,
        consolidationSessions: sessionsCount || 0,
        lastConsolidation: lastSession?.created_at || null,
        isConsolidating: false
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  }, [user]);

  // Setup automatic consolidation
  useEffect(() => {
    if (!user) return;

    // Run consolidation every hour
    const interval = setInterval(runMemoryConsolidation, 60 * 60 * 1000);
    
    // Run memory decay every 30 minutes
    const decayInterval = setInterval(applyMemoryDecay, 30 * 60 * 1000);

    // Load initial stats
    loadStats();

    return () => {
      clearInterval(interval);
      clearInterval(decayInterval);
    };
  }, [user, runMemoryConsolidation, applyMemoryDecay, loadStats]);

  return {
    stats,
    saveInteractionAsMemory,
    runMemoryConsolidation,
    boostMemoryActivation,
    applyMemoryDecay,
    loadStats
  };
}

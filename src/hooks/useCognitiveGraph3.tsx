
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface CognitiveCluster {
  id: string;
  cluster_type: string;
  member_nodes: string[];
  density_score: number;
  coherence_score: number;
  temporal_stability: number;
  discovery_method: string;
  created_at: string;
  metadata: any;
}

export interface MemoryConsolidationSession {
  id: string;
  session_type: string;
  nodes_processed: number;
  connections_strengthened: number;
  patterns_discovered: number;
  consolidation_quality: number;
  started_at: string;
  completed_at: string;
  metadata: any;
}

export interface ShortTermMemory {
  id: string;
  interaction_data: any;
  cognitive_context: any;
  emotional_valence: number;
  importance_score: number;
  buffer_position: number;
  created_at: string;
}

export interface CognitiveEvolutionStats {
  total_nodes: number;
  avg_activation: number;
  long_term_memories: number;
  recent_nodes: number;
  avg_consolidation: number;
  concept_diversity: number;
  last_activity: string;
}

export function useCognitiveGraph3() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState<CognitiveCluster[]>([]);
  const [consolidationSessions, setConsolidationSessions] = useState<MemoryConsolidationSession[]>([]);
  const [shortTermBuffer, setShortTermBuffer] = useState<ShortTermMemory[]>([]);
  const [evolutionStats, setEvolutionStats] = useState<CognitiveEvolutionStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memory consolidation
  const consolidateMemory = useCallback(async (thresholdHours: number = 6) => {
    if (!user) return null;

    try {
      setIsProcessing(true);
      console.log('🧠 Starting memory consolidation...');

      const { data, error } = await supabase.functions.invoke('cognitive-graph-3', {
        body: {
          userId: user.id,
          operation: 'consolidate',
          options: { thresholdHours }
        }
      });

      if (error) throw error;

      console.log('✅ Memory consolidation completed:', data);
      await loadConsolidationSessions();
      await loadEvolutionStats();
      
      return data;
    } catch (error) {
      console.error('❌ Memory consolidation error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Discover cognitive clusters
  const discoverClusters = useCallback(async (minClusterSize: number = 3, similarityThreshold: number = 0.8) => {
    if (!user) return null;

    try {
      setIsProcessing(true);
      console.log('🔍 Discovering cognitive clusters...');

      const { data, error } = await supabase.functions.invoke('cognitive-graph-3', {
        body: {
          userId: user.id,
          operation: 'discover_clusters',
          options: { minClusterSize, similarityThreshold }
        }
      });

      if (error) throw error;

      console.log('✅ Cluster discovery completed:', data);
      await loadClusters();
      
      return data;
    } catch (error) {
      console.error('❌ Cluster discovery error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Generate multiple embedding types for content
  const generateMultipleEmbeddings = useCallback(async (content: string, nodeId: string) => {
    if (!user) return null;

    try {
      console.log('🧮 Generating multiple embeddings...');

      const { data, error } = await supabase.functions.invoke('cognitive-graph-3', {
        body: {
          userId: nodeId, // Using nodeId as identifier for this operation
          operation: 'generate_embeddings',
          options: { content }
        }
      });

      if (error) throw error;

      console.log('✅ Multiple embeddings generated:', data);
      return data;
    } catch (error) {
      console.error('❌ Embedding generation error:', error);
      throw error;
    }
  }, [user]);

  // Add interaction to short-term memory buffer
  const addToShortTermBuffer = useCallback(async (interactionData: any) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('short_term_memory')
        .insert({
          user_id: user.id,
          interaction_data: interactionData,
          cognitive_context: {
            timestamp: new Date().toISOString(),
            session_context: 'web_interface'
          },
          importance_score: calculateImportanceScore(interactionData),
          buffer_position: Date.now() // Simple position based on timestamp
        })
        .select()
        .single();

      if (error) throw error;

      setShortTermBuffer(prev => [data, ...prev.slice(0, 99)]); // Keep last 100
      return data;
    } catch (error) {
      console.error('❌ Short-term buffer error:', error);
      throw error;
    }
  }, [user]);

  // Load cognitive clusters
  const loadClusters = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cognitive_clusters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClusters(data || []);
    } catch (error) {
      console.error('❌ Error loading clusters:', error);
    }
  }, [user]);

  // Load consolidation sessions
  const loadConsolidationSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('memory_consolidation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setConsolidationSessions(data || []);
    } catch (error) {
      console.error('❌ Error loading consolidation sessions:', error);
    }
  }, [user]);

  // Load short-term memory buffer
  const loadShortTermBuffer = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('short_term_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setShortTermBuffer(data || []);
    } catch (error) {
      console.error('❌ Error loading short-term buffer:', error);
    }
  }, [user]);

  // Load cognitive evolution stats
  const loadEvolutionStats = useCallback(async () => {
    if (!user) return;

    try {
      // Refresh materialized view first
      await supabase.rpc('refresh_materialized_view', { 
        view_name: 'cognitive_evolution_stats' 
      });

      const { data, error } = await supabase
        .from('cognitive_evolution_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors

      setEvolutionStats(data || null);
    } catch (error) {
      console.error('❌ Error loading evolution stats:', error);
    }
  }, [user]);

  // Calculate importance score for interactions
  const calculateImportanceScore = (interactionData: any): number => {
    let score = 0.5; // Base score

    if (interactionData.type === 'insight') score += 0.3;
    if (interactionData.type === 'decision') score += 0.2;
    if (interactionData.type === 'pattern') score += 0.2;
    
    if (interactionData.content && interactionData.content.length > 500) score += 0.1;
    if (interactionData.relatedNodes && interactionData.relatedNodes.length > 0) score += 0.1;

    return Math.min(1.0, score);
  };

  // Auto-consolidation effect (every 30 minutes)
  useEffect(() => {
    if (!user) return;

    const autoConsolidationInterval = setInterval(() => {
      consolidateMemory(6); // Consolidate memories from last 6 hours
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(autoConsolidationInterval);
  }, [user, consolidateMemory]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadClusters();
      loadConsolidationSessions();
      loadShortTermBuffer();
      loadEvolutionStats();
    }
  }, [user, loadClusters, loadConsolidationSessions, loadShortTermBuffer, loadEvolutionStats]);

  return {
    // State
    clusters,
    consolidationSessions,
    shortTermBuffer,
    evolutionStats,
    isProcessing,

    // Actions
    consolidateMemory,
    discoverClusters,
    generateMultipleEmbeddings,
    addToShortTermBuffer,

    // Data loading
    loadClusters,
    loadConsolidationSessions,
    loadShortTermBuffer,
    loadEvolutionStats
  };
}

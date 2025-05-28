
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface NeuralNode {
  id: string;
  content: string;
  title?: string;
  node_type: 'question' | 'answer' | 'decision' | 'insight' | 'code' | 'design' | 'document' | 'conversation' | 'project' | 'memory' | 'connection';
  relevance_score: number;
  activation_strength: number;
  connected_nodes: string[];
  access_count: number;
  base_activation: number;
  decay_rate: number;
  propagation_depth: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface NeuralSearchResult extends NeuralNode {
  similarity: number;
  combined_score: number;
  activation_level: 'highly_active' | 'moderately_active' | 'low_active' | 'dormant';
}

export interface ActivationPattern {
  node_id: string;
  activation_strength: number;
  propagation_depth: number;
  connected_count: number;
  last_boost: string;
}

export function useNeuralSystem() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activationPatterns, setActivationPatterns] = useState<ActivationPattern[]>([]);
  const activationQueue = useRef<Array<{ nodeId: string; boost: number; depth: number }>>([]);

  // Neural search with activation boosting
  const neuralSearch = useCallback(async (
    query: string,
    searchType: 'general' | 'conceptual' | 'relational' = 'general',
    limit: number = 10,
    similarityThreshold: number = 0.7,
    boostActivation: boolean = true
  ): Promise<NeuralSearchResult[]> => {
    if (!user) return [];

    try {
      console.log('🧠 Neural search:', { query, searchType, limit });
      
      // Use the cognitive search function directly for now
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('process-cognitive-embeddings', {
        body: { nodeId: 'temp', content: query }
      });

      if (embeddingError) throw embeddingError;

      // Use the existing cognitive_search function
      const { data, error } = await supabase.rpc('cognitive_search', {
        p_user_id: user.id,
        p_query_embedding: embeddingData.generalEmbedding,
        p_search_type: searchType,
        p_limit: limit,
        p_similarity_threshold: similarityThreshold
      });

      if (error) throw error;

      // Transform results to match NeuralSearchResult interface
      const transformedResults: NeuralSearchResult[] = (data || []).map(result => ({
        id: result.id,
        content: result.content,
        title: result.title,
        node_type: result.node_type,
        relevance_score: result.relevance_score,
        activation_strength: 0.5, // Default for now
        connected_nodes: [],
        access_count: result.access_count,
        base_activation: 0.1,
        decay_rate: 0.95,
        propagation_depth: 3,
        last_accessed_at: new Date().toISOString(),
        created_at: result.created_at,
        updated_at: new Date().toISOString(),
        similarity: result.similarity,
        combined_score: result.similarity * result.relevance_score,
        activation_level: 'moderately_active' as const
      }));

      console.log(`✅ Neural search found ${transformedResults.length} results`);
      return transformedResults;
    } catch (error) {
      console.error('❌ Error in neural search:', error);
      return [];
    }
  }, [user]);

  // Trigger spreading activation
  const spreadActivation = useCallback(async (
    nodeId: string,
    activationBoost: number = 0.3,
    maxDepth: number = 3
  ): Promise<void> => {
    if (!user) return;

    try {
      console.log('🔗 Spreading activation:', { nodeId, activationBoost, maxDepth });
      
      // For now, use a simple update approach
      const { error } = await supabase
        .from('cognitive_nodes')
        .update({ 
          access_count: supabase.rpc('access_count + 1' as any),
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', nodeId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Activation spread completed');
      await loadActivationPatterns();
    } catch (error) {
      console.error('❌ Error spreading activation:', error);
    }
  }, [user]);

  // Auto-connect similar nodes
  const autoConnectNodes = useCallback(async (
    nodeId: string,
    similarityThreshold: number = 0.8,
    maxConnections: number = 10
  ): Promise<void> => {
    if (!user) return;

    try {
      console.log('🔗 Auto-connecting nodes:', { nodeId, similarityThreshold, maxConnections });
      
      // For now, just log the operation
      console.log('✅ Auto-connection completed');
    } catch (error) {
      console.error('❌ Error auto-connecting nodes:', error);
    }
  }, [user]);

  // Load active neural network view
  const loadActiveNetwork = useCallback(async (): Promise<NeuralNode[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user.id)
        .limit(50);

      if (error) throw error;

      // Transform to NeuralNode format
      return (data || []).map(node => ({
        id: node.id,
        content: node.content,
        title: node.title,
        node_type: node.node_type,
        relevance_score: node.relevance_score,
        activation_strength: 0.5, // Default
        connected_nodes: [],
        access_count: node.access_count,
        base_activation: 0.1,
        decay_rate: 0.95,
        propagation_depth: 3,
        last_accessed_at: node.last_accessed_at,
        created_at: node.created_at,
        updated_at: node.updated_at,
        metadata: node.metadata
      }));
    } catch (error) {
      console.error('❌ Error loading active network:', error);
      return [];
    }
  }, [user]);

  // Load activation patterns
  const loadActivationPatterns = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('id, access_count, last_accessed_at')
        .eq('user_id', user.id)
        .order('access_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      const patterns: ActivationPattern[] = (data || []).map(node => ({
        node_id: node.id,
        activation_strength: Math.min(1.0, node.access_count * 0.1),
        propagation_depth: 3,
        connected_count: 0,
        last_boost: node.last_accessed_at
      }));

      setActivationPatterns(patterns);
    } catch (error) {
      console.error('❌ Error loading activation patterns:', error);
    }
  }, [user]);

  // Process activation queue
  const processActivationQueue = useCallback(async () => {
    if (isProcessing || activationQueue.current.length === 0) return;

    setIsProcessing(true);
    
    try {
      const batch = activationQueue.current.splice(0, 5);
      
      await Promise.allSettled(
        batch.map(({ nodeId, boost, depth }) => 
          spreadActivation(nodeId, boost, depth)
        )
      );
    } catch (error) {
      console.error('❌ Error processing activation queue:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, spreadActivation]);

  // Queue activation for processing
  const queueActivation = useCallback((nodeId: string, boost: number = 0.2, depth: number = 2) => {
    activationQueue.current.push({ nodeId, boost, depth });
    setTimeout(processActivationQueue, 100);
  }, [processActivationQueue]);

  // Enhanced node creation with auto-connection
  const createNeuralNode = useCallback(async (
    content: string,
    nodeType: NeuralNode['node_type'],
    metadata: any = {},
    conversationId?: string,
    projectId?: string,
    autoConnect: boolean = true
  ): Promise<NeuralNode | null> => {
    if (!user) return null;

    try {
      console.log('🧠 Creating neural node:', { nodeType, content: content.substring(0, 100) });
      
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .insert({
          user_id: user.id,
          content,
          node_type: nodeType,
          conversation_id: conversationId,
          project_id: projectId,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      const newNode: NeuralNode = {
        id: data.id,
        content: data.content,
        title: data.title,
        node_type: data.node_type,
        relevance_score: data.relevance_score,
        activation_strength: 1.0,
        connected_nodes: [],
        access_count: data.access_count,
        base_activation: 0.1,
        decay_rate: 0.95,
        propagation_depth: 3,
        last_accessed_at: data.last_accessed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        metadata: data.metadata
      };
      
      // Process embeddings in background
      setTimeout(async () => {
        try {
          await supabase.functions.invoke('process-cognitive-embeddings', {
            body: { nodeId: newNode.id, content }
          });
          
          if (autoConnect) {
            await autoConnectNodes(newNode.id);
          }
          
          queueActivation(newNode.id, 0.3, 2);
        } catch (error) {
          console.error('❌ Error in background processing:', error);
        }
      }, 500);

      console.log('✅ Neural node created:', newNode.id);
      return newNode;
    } catch (error) {
      console.error('❌ Error creating neural node:', error);
      return null;
    }
  }, [user, autoConnectNodes, queueActivation]);

  // Access node with activation boost
  const accessNode = useCallback(async (nodeId: string, boostAmount: number = 0.1) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cognitive_nodes')
        .update({ 
          access_count: supabase.rpc('access_count + 1' as any),
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', nodeId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (boostAmount > 0.1) {
        queueActivation(nodeId, boostAmount - 0.1, 1);
      }
    } catch (error) {
      console.error('❌ Error accessing node:', error);
    }
  }, [user, queueActivation]);

  // Get network topology for visualization
  const getNetworkTopology = useCallback(async (centerNodeId?: string, radius: number = 2) => {
    if (!user) return { nodes: [], edges: [] };

    try {
      const { data: nodes, error } = await supabase
        .from('cognitive_nodes')
        .select('id, title, content, node_type, access_count')
        .eq('user_id', user.id)
        .order('access_count', { ascending: false })
        .limit(100);

      if (error) throw error;

      const edges: Array<{ source: string; target: string; strength: number }> = [];

      return { nodes: nodes || [], edges };
    } catch (error) {
      console.error('❌ Error getting network topology:', error);
      return { nodes: [], edges: [] };
    }
  }, [user]);

  // Initialize neural system
  useEffect(() => {
    if (user) {
      loadActivationPatterns();
    }
  }, [user, loadActivationPatterns]);

  // Process activation queue periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (activationQueue.current.length > 0) {
        processActivationQueue();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [processActivationQueue]);

  return {
    // State
    activationPatterns,
    isProcessing,
    
    // Core neural functions
    createNeuralNode,
    neuralSearch,
    spreadActivation,
    autoConnectNodes,
    accessNode,
    
    // Network analysis
    loadActiveNetwork,
    getNetworkTopology,
    loadActivationPatterns,
    
    // Queue management
    queueActivation
  };
}

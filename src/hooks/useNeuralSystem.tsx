
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

// Sprint 3: Memory Consolidation, Priming & Predictive Caching
export interface MemoryConsolidation {
  id: string;
  consolidated_nodes: string[];
  consolidation_score: number;
  pattern_type: 'temporal' | 'semantic' | 'contextual' | 'behavioral';
  created_at: string;
}

export interface PrimingContext {
  context_id: string;
  primed_nodes: string[];
  priming_strength: number;
  decay_rate: number;
  trigger_patterns: string[];
}

export interface PredictiveCache {
  query_pattern: string;
  predicted_nodes: string[];
  confidence_score: number;
  hit_count: number;
  last_used: string;
}

export function useNeuralSystem() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activationPatterns, setActivationPatterns] = useState<ActivationPattern[]>([]);
  const [memoryConsolidations, setMemoryConsolidations] = useState<MemoryConsolidation[]>([]);
  const [primingContexts, setPrimingContexts] = useState<PrimingContext[]>([]);
  const [predictiveCache, setPredictiveCache] = useState<PredictiveCache[]>([]);
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
      console.log('🧠 Neural search with Sprint 3 enhancements:', { query, searchType, limit });
      
      // Check predictive cache first
      const cachedResults = await checkPredictiveCache(query);
      if (cachedResults.length > 0) {
        console.log('🎯 Cache hit! Using predicted results');
        return cachedResults;
      }

      // Use the cognitive search function directly
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('process-cognitive-embeddings', {
        body: { nodeId: 'temp', content: query }
      });

      if (embeddingError) throw embeddingError;

      // Use the enhanced neural cognitive search function
      const { data, error } = await supabase.rpc('neural_cognitive_search', {
        p_user_id: user.id,
        p_query_embedding: embeddingData.generalEmbedding,
        p_search_type: searchType,
        p_limit: limit,
        p_similarity_threshold: similarityThreshold,
        p_boost_activation: boostActivation
      });

      if (error) throw error;

      // Transform results to match NeuralSearchResult interface
      const transformedResults: NeuralSearchResult[] = (data || []).map(result => ({
        id: result.id,
        content: result.content,
        title: result.title,
        node_type: result.node_type,
        relevance_score: result.relevance_score,
        activation_strength: result.activation_strength || 0.5,
        connected_nodes: [],
        access_count: result.access_count,
        base_activation: 0.1,
        decay_rate: 0.95,
        propagation_depth: 3,
        last_accessed_at: new Date().toISOString(),
        created_at: result.created_at,
        updated_at: new Date().toISOString(),
        similarity: result.similarity,
        combined_score: result.combined_score || (result.similarity * result.relevance_score),
        activation_level: result.activation_strength > 0.7 ? 'highly_active' : 
                        result.activation_strength > 0.4 ? 'moderately_active' : 
                        result.activation_strength > 0.1 ? 'low_active' : 'dormant'
      }));

      // Update predictive cache
      await updatePredictiveCache(query, transformedResults);

      // Trigger priming for related contexts
      await triggerContextualPriming(query, transformedResults);

      console.log(`✅ Enhanced neural search found ${transformedResults.length} results`);
      return transformedResults;
    } catch (error) {
      console.error('❌ Error in enhanced neural search:', error);
      return [];
    }
  }, [user]);

  // Sprint 3: Memory Consolidation
  const consolidateMemories = useCallback(async (
    timeWindow: number = 24, // hours
    minClusterSize: number = 3
  ): Promise<MemoryConsolidation[]> => {
    if (!user) return [];

    try {
      console.log('🧠 Starting memory consolidation...');

      const { data, error } = await supabase.functions.invoke('cognitive-search', {
        body: {
          command: 'memory_consolidation',
          userId: user.id,
          parameters: {
            timeWindow,
            minClusterSize,
            consolidationType: 'temporal_semantic'
          }
        }
      });

      if (error) throw error;

      const consolidations: MemoryConsolidation[] = data.consolidations || [];
      setMemoryConsolidations(consolidations);

      console.log(`✅ Memory consolidation completed: ${consolidations.length} patterns found`);
      return consolidations;
    } catch (error) {
      console.error('❌ Memory consolidation error:', error);
      return [];
    }
  }, [user]);

  // Sprint 3: Contextual Priming
  const triggerContextualPriming = useCallback(async (
    context: string,
    relevantNodes: NeuralSearchResult[]
  ): Promise<void> => {
    if (!user || relevantNodes.length === 0) return;

    try {
      console.log('🎯 Triggering contextual priming...');

      // Extract semantic patterns from context
      const contextPatterns = extractContextPatterns(context);
      
      // Find nodes that should be primed based on patterns
      const nodesToPrime = relevantNodes
        .filter(node => node.combined_score > 0.6)
        .slice(0, 10)
        .map(node => node.id);

      if (nodesToPrime.length === 0) return;

      // Create priming context
      const primingContext: PrimingContext = {
        context_id: `priming_${Date.now()}`,
        primed_nodes: nodesToPrime,
        priming_strength: 0.3,
        decay_rate: 0.9,
        trigger_patterns: contextPatterns
      };

      // Boost activation for primed nodes
      for (const nodeId of nodesToPrime) {
        queueActivation(nodeId, 0.2, 1);
      }

      setPrimingContexts(prev => [...prev.slice(-9), primingContext]);
      
      console.log(`✅ Primed ${nodesToPrime.length} nodes for context patterns`);
    } catch (error) {
      console.error('❌ Contextual priming error:', error);
    }
  }, [user]);

  // Sprint 3: Predictive Caching
  const checkPredictiveCache = useCallback(async (
    query: string
  ): Promise<NeuralSearchResult[]> => {
    try {
      // Simple pattern matching for cache lookup
      const queryPattern = extractQueryPattern(query);
      
      const cachedEntry = predictiveCache.find(cache => 
        cache.query_pattern === queryPattern &&
        cache.confidence_score > 0.7 &&
        (Date.now() - new Date(cache.last_used).getTime()) < 3600000 // 1 hour
      );

      if (!cachedEntry) return [];

      // Fetch cached nodes
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user!.id)
        .in('id', cachedEntry.predicted_nodes);

      if (error) throw error;

      // Update cache hit count
      setPredictiveCache(prev => 
        prev.map(cache => 
          cache.query_pattern === queryPattern 
            ? { ...cache, hit_count: cache.hit_count + 1, last_used: new Date().toISOString() }
            : cache
        )
      );

      return (data || []).map(node => ({
        id: node.id,
        content: node.content,
        title: node.title,
        node_type: node.node_type,
        relevance_score: node.relevance_score,
        activation_strength: node.activation_strength || 0.5,
        connected_nodes: node.connected_nodes || [],
        access_count: node.access_count,
        base_activation: node.base_activation || 0.1,
        decay_rate: node.decay_rate || 0.95,
        propagation_depth: node.propagation_depth || 3,
        last_accessed_at: node.last_accessed_at,
        created_at: node.created_at,
        updated_at: node.updated_at,
        metadata: node.metadata,
        similarity: 0.9, // High similarity for cached results
        combined_score: 0.9,
        activation_level: 'highly_active' as const
      }));
    } catch (error) {
      console.error('❌ Predictive cache check error:', error);
      return [];
    }
  }, [user, predictiveCache]);

  const updatePredictiveCache = useCallback(async (
    query: string,
    results: NeuralSearchResult[]
  ): Promise<void> => {
    if (results.length === 0) return;

    try {
      const queryPattern = extractQueryPattern(query);
      const topNodes = results.slice(0, 5).map(r => r.id);
      
      const cacheEntry: PredictiveCache = {
        query_pattern: queryPattern,
        predicted_nodes: topNodes,
        confidence_score: results[0]?.combined_score || 0.5,
        hit_count: 0,
        last_used: new Date().toISOString()
      };

      setPredictiveCache(prev => {
        const filtered = prev.filter(cache => cache.query_pattern !== queryPattern);
        return [...filtered.slice(-19), cacheEntry]; // Keep last 20 entries
      });
    } catch (error) {
      console.error('❌ Predictive cache update error:', error);
    }
  }, []);

  // Helper functions for Sprint 3
  const extractContextPatterns = (context: string): string[] => {
    const words = context.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 10);
  };

  const extractQueryPattern = (query: string): string => {
    const normalized = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 5)
      .sort()
      .join('_');
    
    return normalized || 'generic_query';
  };

  // Trigger spreading activation
  const spreadActivation = useCallback(async (
    nodeId: string,
    activationBoost: number = 0.3,
    maxDepth: number = 3
  ): Promise<void> => {
    if (!user) return;

    try {
      console.log('🔗 Spreading activation:', { nodeId, activationBoost, maxDepth });
      
      const { error } = await supabase.rpc('spread_activation', {
        source_node_id: nodeId,
        activation_boost: activationBoost,
        max_depth: maxDepth
      });

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
      
      const { error } = await supabase.rpc('auto_connect_similar_nodes', {
        node_id: nodeId,
        similarity_threshold: similarityThreshold,
        max_connections: maxConnections
      });

      if (error) throw error;

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
        .eq('status', 'active')
        .gte('activation_strength', 0.1)
        .order('activation_strength', { ascending: false })
        .order('last_accessed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(node => ({
        id: node.id,
        content: node.content,
        title: node.title,
        node_type: node.node_type,
        relevance_score: node.relevance_score,
        activation_strength: node.activation_strength || 0.5,
        connected_nodes: node.connected_nodes || [],
        access_count: node.access_count,
        base_activation: node.base_activation || 0.1,
        decay_rate: node.decay_rate || 0.95,
        propagation_depth: node.propagation_depth || 3,
        last_accessed_at: node.last_accessed_at,
        created_at: node.created_at,
        updated_at: node.updated_at,
        metadata: node.metadata || {}
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
        .select('id, activation_strength, connected_nodes, last_accessed_at')
        .eq('user_id', user.id)
        .order('activation_strength', { ascending: false })
        .limit(20);

      if (error) throw error;

      const patterns: ActivationPattern[] = (data || []).map(node => ({
        node_id: node.id,
        activation_strength: node.activation_strength || 0.5,
        propagation_depth: 3,
        connected_count: Array.isArray(node.connected_nodes) ? node.connected_nodes.length : 0,
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
      console.log('🧠 Creating enhanced neural node:', { nodeType, content: content.substring(0, 100) });
      
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .insert({
          user_id: user.id,
          content,
          node_type: nodeType,
          conversation_id: conversationId,
          project_id: projectId,
          metadata,
          activation_strength: 1.0,
          base_activation: 0.1,
          decay_rate: 0.95,
          propagation_depth: 3,
          connected_nodes: []
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
        activation_strength: data.activation_strength || 1.0,
        connected_nodes: data.connected_nodes || [],
        access_count: data.access_count,
        base_activation: data.base_activation || 0.1,
        decay_rate: data.decay_rate || 0.95,
        propagation_depth: data.propagation_depth || 3,
        last_accessed_at: data.last_accessed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        metadata: data.metadata
      };
      
      // Process embeddings and connections in background
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

      console.log('✅ Enhanced neural node created:', newNode.id);
      return newNode;
    } catch (error) {
      console.error('❌ Error creating enhanced neural node:', error);
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
        .select('id, title, content, node_type, access_count, activation_strength, connected_nodes')
        .eq('user_id', user.id)
        .order('activation_strength', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Build edges from connected_nodes arrays
      const edges: Array<{ source: string; target: string; strength: number }> = [];
      
      (nodes || []).forEach(node => {
        if (Array.isArray(node.connected_nodes)) {
          node.connected_nodes.forEach(connectedId => {
            const targetNode = nodes?.find(n => n.id === connectedId);
            if (targetNode) {
              edges.push({
                source: node.id,
                target: connectedId,
                strength: ((node.activation_strength || 0) + (targetNode.activation_strength || 0)) / 2
              });
            }
          });
        }
      });

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
      consolidateMemories(); // Auto-consolidate memories on init
    }
  }, [user, loadActivationPatterns, consolidateMemories]);

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
    
    // Sprint 3: New state
    memoryConsolidations,
    primingContexts,
    predictiveCache,
    
    // Core neural functions
    createNeuralNode,
    neuralSearch,
    spreadActivation,
    autoConnectNodes,
    accessNode,
    
    // Sprint 3: New functions
    consolidateMemories,
    triggerContextualPriming,
    checkPredictiveCache,
    updatePredictiveCache,
    
    // Network analysis
    loadActiveNetwork,
    getNetworkTopology,
    loadActivationPatterns,
    
    // Queue management
    queueActivation
  };
}

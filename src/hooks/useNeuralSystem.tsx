
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface NeuralNode {
  id: string;
  content: string;
  title?: string;
  node_type: 'question' | 'answer' | 'decision' | 'insight' | 'code' | 'design' | 'document' | 'conversation' | 'project' | 'memory' | 'connection';
  relevance_score: number;
  access_count: number;
  activation_strength: number;
  connected_nodes: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface ActivationPattern {
  node_id: string;
  activation_strength: number;
  propagation_depth: number;
  connected_count: number;
  last_boost: string;
}

export interface MemoryConsolidation {
  id: string;
  session_type: 'automatic' | 'manual' | 'triggered';
  nodes_processed: number;
  consolidation_quality: number;
  completed_at: string;
}

export interface PrimingContext {
  context_type: 'recent' | 'frequent' | 'connected' | 'similar';
  nodes: NeuralNode[];
  strength: number;
  last_update: string;
}

export function useNeuralSystem() {
  const { user } = useAuth();
  const [activationPatterns, setActivationPatterns] = useState<ActivationPattern[]>([]);
  const [memoryConsolidations, setMemoryConsolidations] = useState<MemoryConsolidation[]>([]);
  const [primingContexts, setPrimingContexts] = useState<PrimingContext[]>([]);
  const [predictiveCache, setPredictiveCache] = useState<Map<string, any>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  const activationMap = useRef<Map<string, number>>(new Map());
  const connectionGraph = useRef<Map<string, string[]>>(new Map());

  // Create neural node with auto-connection
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
      console.log('🧠 Creating neural node:', { nodeType, autoConnect });
      
      const { data, error } = await supabase.functions.invoke('create-neural-node', {
        body: {
          content,
          nodeType,
          metadata,
          conversationId,
          projectId,
          autoConnect,
          userId: user.id
        }
      });

      if (error) throw error;

      const neuralNode: NeuralNode = {
        id: data.id,
        content,
        title: data.title,
        node_type: nodeType,
        relevance_score: 0.8,
        access_count: 1,
        activation_strength: 1.0,
        connected_nodes: data.connected_nodes || [],
        metadata: { ...metadata, created_by: 'neural_system' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update local activation map
      activationMap.current.set(neuralNode.id, 1.0);
      
      // Update connection graph
      if (neuralNode.connected_nodes.length > 0) {
        connectionGraph.current.set(neuralNode.id, neuralNode.connected_nodes);
      }

      console.log('✅ Neural node created with connections:', neuralNode.connected_nodes.length);
      return neuralNode;
    } catch (error) {
      console.error('❌ Error creating neural node:', error);
      return null;
    }
  }, [user]);

  // Neural search with activation boosting
  const neuralSearch = useCallback(async (
    query: string,
    searchType: 'general' | 'conceptual' | 'relational' = 'general',
    limit: number = 10,
    similarityThreshold: number = 0.7,
    boostActivation: boolean = true
  ): Promise<NeuralNode[]> => {
    if (!user) return [];

    try {
      console.log('🔍 Neural search:', { query, searchType, boostActivation });
      
      const { data, error } = await supabase.functions.invoke('neural-cognitive-search', {
        body: {
          query,
          searchType,
          limit,
          similarityThreshold,
          boostActivation,
          userId: user.id
        }
      });

      if (error) throw error;

      const results: NeuralNode[] = data.results.map((result: any) => ({
        id: result.id,
        content: result.content,
        title: result.title,
        node_type: result.node_type,
        relevance_score: result.relevance_score,
        access_count: result.access_count,
        activation_strength: result.activation_strength || 0.5,
        connected_nodes: result.connected_nodes || [],
        metadata: result.metadata || {},
        created_at: result.created_at,
        updated_at: result.updated_at
      }));

      // Update activation patterns
      if (boostActivation) {
        const newPatterns: ActivationPattern[] = results.map(node => ({
          node_id: node.id,
          activation_strength: node.activation_strength,
          propagation_depth: 1,
          connected_count: node.connected_nodes.length,
          last_boost: new Date().toISOString()
        }));

        setActivationPatterns(prev => {
          const updated = [...prev];
          newPatterns.forEach(pattern => {
            const existingIndex = updated.findIndex(p => p.node_id === pattern.node_id);
            if (existingIndex >= 0) {
              updated[existingIndex] = pattern;
            } else {
              updated.push(pattern);
            }
          });
          return updated.slice(0, 50); // Keep only top 50
        });
      }

      console.log(`✅ Neural search found ${results.length} nodes`);
      return results;
    } catch (error) {
      console.error('❌ Error in neural search:', error);
      return [];
    }
  }, [user]);

  // Access node and spread activation
  const accessNode = useCallback(async (nodeId: string, activationBoost: number = 0.1) => {
    if (!user) return;

    try {
      // Spread activation to connected nodes
      const { error } = await supabase.functions.invoke('spread-activation', {
        body: {
          sourceNodeId: nodeId,
          activationBoost,
          maxDepth: 3,
          userId: user.id
        }
      });

      if (error) throw error;

      // Update local activation
      const currentActivation = activationMap.current.get(nodeId) || 0;
      activationMap.current.set(nodeId, Math.min(1.0, currentActivation + activationBoost));

      console.log(`🧠 Activation spread from node ${nodeId}`);
    } catch (error) {
      console.error('❌ Error spreading activation:', error);
    }
  }, [user]);

  // Load activation patterns
  const loadActivationPatterns = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📊 Loading activation patterns...');
      
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('id, activation_strength, connected_nodes, access_count, last_accessed_at')
        .eq('user_id', user.id)
        .gt('activation_strength', 0.1)
        .order('activation_strength', { ascending: false })
        .limit(20);

      if (error) throw error;

      const patterns: ActivationPattern[] = (data || []).map(node => ({
        node_id: node.id,
        activation_strength: node.activation_strength || 0.5,
        propagation_depth: 1,
        connected_count: Array.isArray(node.connected_nodes) ? node.connected_nodes.length : 0,
        last_boost: node.last_accessed_at || new Date().toISOString()
      }));

      setActivationPatterns(patterns);
      console.log(`✅ Loaded ${patterns.length} activation patterns`);
    } catch (error) {
      console.error('❌ Error loading activation patterns:', error);
    }
  }, [user]);

  // Load active network
  const loadActiveNetwork = useCallback(async (): Promise<NeuralNode[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('activation_strength', 0.3)
        .order('activation_strength', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(node => ({
        id: node.id,
        content: node.content,
        title: node.title,
        node_type: node.node_type,
        relevance_score: node.relevance_score || 0.5,
        access_count: node.access_count || 0,
        activation_strength: node.activation_strength || 0.5,
        connected_nodes: node.connected_nodes || [],
        metadata: node.metadata || {},
        created_at: node.created_at,
        updated_at: node.updated_at
      }));
    } catch (error) {
      console.error('❌ Error loading active network:', error);
      return [];
    }
  }, [user]);

  // Consolidate memory
  const consolidateMemory = useCallback(async (sessionType: 'automatic' | 'manual' = 'automatic') => {
    if (!user) return null;

    setIsProcessing(true);
    try {
      console.log('🧠 Starting memory consolidation...');
      
      const { data, error } = await supabase.functions.invoke('consolidate-memory', {
        body: {
          userId: user.id,
          sessionType,
          thresholdHours: 6
        }
      });

      if (error) throw error;

      const consolidation: MemoryConsolidation = {
        id: data.session_id,
        session_type: sessionType,
        nodes_processed: data.nodes_processed,
        consolidation_quality: data.consolidation_quality,
        completed_at: new Date().toISOString()
      };

      setMemoryConsolidations(prev => [consolidation, ...prev.slice(0, 9)]);
      
      console.log(`✅ Memory consolidation completed: ${data.nodes_processed} nodes processed`);
      return consolidation;
    } catch (error) {
      console.error('❌ Error in memory consolidation:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Update priming contexts
  const updatePrimingContexts = useCallback(async () => {
    if (!user) return;

    try {
      const activeNodes = await loadActiveNetwork();
      
      const contexts: PrimingContext[] = [
        {
          context_type: 'recent',
          nodes: activeNodes.slice(0, 10),
          strength: 0.9,
          last_update: new Date().toISOString()
        },
        {
          context_type: 'frequent',
          nodes: activeNodes.filter(n => n.access_count > 5).slice(0, 8),
          strength: 0.8,
          last_update: new Date().toISOString()
        },
        {
          context_type: 'connected',
          nodes: activeNodes.filter(n => n.connected_nodes.length > 2).slice(0, 6),
          strength: 0.7,
          last_update: new Date().toISOString()
        }
      ];

      setPrimingContexts(contexts);
      console.log('🎯 Priming contexts updated');
    } catch (error) {
      console.error('❌ Error updating priming contexts:', error);
    }
  }, [user, loadActiveNetwork]);

  // Predictive caching
  const updatePredictiveCache = useCallback((key: string, value: any, ttl: number = 300000) => {
    setPredictiveCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, {
        value,
        timestamp: Date.now(),
        ttl
      });
      return newCache;
    });
  }, []);

  // Initialize neural system
  useEffect(() => {
    if (user) {
      loadActivationPatterns();
      updatePrimingContexts();
    }
  }, [user, loadActivationPatterns, updatePrimingContexts]);

  // Periodic updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        updatePrimingContexts();
      }, 120000); // Every 2 minutes

      return () => clearInterval(interval);
    }
  }, [user, updatePrimingContexts]);

  return {
    // Core neural functions
    createNeuralNode,
    neuralSearch,
    accessNode,
    
    // Network management
    loadActivationPatterns,
    loadActiveNetwork,
    
    // Memory consolidation
    consolidateMemory,
    
    // State
    activationPatterns,
    memoryConsolidations,
    primingContexts,
    predictiveCache,
    isProcessing,
    
    // Context management
    updatePrimingContexts,
    updatePredictiveCache
  };
}

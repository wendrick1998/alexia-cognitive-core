import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { supabase } from '@/integrations/supabase/client';

export interface CognitiveNode {
  id: string;
  content: string;
  title?: string;
  node_type: 'question' | 'answer' | 'decision' | 'insight' | 'code' | 'design' | 'document' | 'conversation' | 'project' | 'memory' | 'connection';
  relevance_score: number;
  access_count: number;
  project_id?: string;
  conversation_id?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface CognitiveConnection {
  id: string;
  source_node_id: string;
  target_node_id: string;
  connection_type: string;
  strength: number;
  metadata: any;
}

export interface CognitiveInsight {
  id: string;
  title: string;
  content: string;
  insight_type: 'pattern' | 'contradiction' | 'opportunity' | 'connection';
  confidence_score: number;
  priority_level: number;
  status: 'pending' | 'shown' | 'dismissed' | 'acted_upon';
  related_nodes: string[];
  created_at: string;
}

export interface ThoughtMode {
  type: 'focus' | 'exploration' | 'analysis' | 'creative';
  description: string;
  active: boolean;
}

export interface CognitiveState {
  currentMode: ThoughtMode;
  activeNodes: CognitiveNode[];
  recentConnections: CognitiveConnection[];
  pendingInsights: CognitiveInsight[];
  cognitiveLoad: number;
  focusLevel: number;
}

export function useCognitiveSystem() {
  const { user } = useAuth();
  const neural = useNeuralSystem();
  
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({
    currentMode: { type: 'focus', description: 'Modo Focado', active: true },
    activeNodes: [],
    recentConnections: [],
    pendingInsights: [],
    cognitiveLoad: 0.0,
    focusLevel: 0.8
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const processingQueue = useRef<Array<{ type: string; data: any; resolve: Function; reject: Function }>>([]);

  // Thought Modes Configuration
  const thoughtModes: ThoughtMode[] = [
    { type: 'focus', description: 'Modo Focado - Chat direto e objetivo', active: false },
    { type: 'exploration', description: 'Modo Exploração - Mostra conexões de conhecimento', active: false },
    { type: 'analysis', description: 'Modo Análise - Métricas e padrões detalhados', active: false },
    { type: 'creative', description: 'Modo Criativo - Geração de ideias e brainstorming', active: false }
  ];

  // Enhanced cognitive node creation using neural system
  const createCognitiveNode = useCallback(async (
    content: string,
    nodeType: CognitiveNode['node_type'],
    metadata: any = {},
    conversationId?: string,
    projectId?: string
  ): Promise<CognitiveNode | null> => {
    if (!user) return null;

    try {
      console.log('🧠 Creating cognitive node with neural enhancement:', { nodeType, content: content.substring(0, 100) });
      
      // Use neural system for enhanced node creation
      const neuralNode = await neural.createNeuralNode(
        content,
        nodeType,
        metadata,
        conversationId,
        projectId,
        true // auto-connect
      );

      if (!neuralNode) return null;

      // Convert to CognitiveNode format
      const cognitiveNode: CognitiveNode = {
        id: neuralNode.id,
        content: neuralNode.content,
        title: neuralNode.title,
        node_type: neuralNode.node_type,
        relevance_score: neuralNode.relevance_score,
        access_count: neuralNode.access_count,
        project_id: projectId,
        conversation_id: conversationId,
        metadata: neuralNode.metadata || metadata,
        created_at: neuralNode.created_at,
        updated_at: neuralNode.updated_at
      };
      
      // Update local state
      setCognitiveState(prev => ({
        ...prev,
        activeNodes: [cognitiveNode, ...prev.activeNodes.slice(0, 9)],
        cognitiveLoad: Math.min(1.0, prev.cognitiveLoad + 0.1)
      }));

      console.log('✅ Enhanced cognitive node created:', cognitiveNode.id);
      return cognitiveNode;
    } catch (error) {
      console.error('❌ Error creating enhanced cognitive node:', error);
      return null;
    }
  }, [user, neural]);

  // Enhanced cognitive search using neural system
  const cognitiveSearch = useCallback(async (
    query: string,
    searchType: 'general' | 'conceptual' | 'relational' = 'general',
    limit: number = 10
  ): Promise<CognitiveNode[]> => {
    if (!user) return [];

    try {
      console.log('🔍 Enhanced cognitive search:', { query, searchType });
      
      // Use neural search with activation boosting
      const neuralResults = await neural.neuralSearch(
        query,
        searchType,
        limit,
        0.7, // similarity threshold
        true // boost activation
      );
      
      // Convert to CognitiveNode format
      const results: CognitiveNode[] = neuralResults.map(result => ({
        id: result.id,
        content: result.content,
        title: result.title,
        node_type: result.node_type,
        relevance_score: result.relevance_score,
        access_count: result.access_count,
        project_id: undefined,
        conversation_id: undefined,
        metadata: result.metadata || {},
        created_at: result.created_at,
        updated_at: result.updated_at
      }));

      console.log(`✅ Enhanced search found ${results.length} nodes with neural activation`);
      return results;
    } catch (error) {
      console.error('❌ Error in enhanced cognitive search:', error);
      return [];
    }
  }, [user, neural]);

  // Load cognitive insights
  const loadCognitiveInsights = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cognitive_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('priority_level', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const transformedInsights: CognitiveInsight[] = (data || []).map(insight => ({
        ...insight,
        insight_type: insight.insight_type as CognitiveInsight['insight_type'],
        status: insight.status as CognitiveInsight['status'],
        related_nodes: Array.isArray(insight.related_nodes) 
          ? insight.related_nodes.map(node => String(node)) 
          : []
      }));

      setCognitiveState(prev => ({
        ...prev,
        pendingInsights: transformedInsights
      }));
    } catch (error) {
      console.error('❌ Erro ao carregar insights:', error);
    }
  }, [user]);

  // Mark insight as shown/acted upon
  const updateInsightStatus = useCallback(async (
    insightId: string, 
    status: 'shown' | 'dismissed' | 'acted_upon'
  ) => {
    try {
      const { error } = await supabase
        .from('cognitive_insights')
        .update({ 
          status,
          [status === 'shown' ? 'shown_at' : 'acted_upon_at']: new Date().toISOString()
        })
        .eq('id', insightId);

      if (error) throw error;

      setCognitiveState(prev => ({
        ...prev,
        pendingInsights: prev.pendingInsights.filter(insight => insight.id !== insightId)
      }));
    } catch (error) {
      console.error('❌ Erro ao atualizar insight:', error);
    }
  }, []);

  // Switch thought mode
  const switchThoughtMode = useCallback((mode: ThoughtMode['type']) => {
    const newMode = thoughtModes.find(m => m.type === mode);
    if (newMode) {
      setCognitiveState(prev => ({
        ...prev,
        currentMode: { ...newMode, active: true }
      }));
      console.log('🧠 Modo de pensamento alterado para:', mode);
    }
  }, []);

  // Create cognitive snapshot
  const createCognitiveSnapshot = useCallback(async (name: string, description?: string) => {
    if (!user) return null;

    try {
      const snapshotData = {
        cognitiveState: {
          currentMode: {
            type: cognitiveState.currentMode.type,
            description: cognitiveState.currentMode.description,
            active: cognitiveState.currentMode.active
          },
          cognitiveLoad: cognitiveState.cognitiveLoad,
          focusLevel: cognitiveState.focusLevel
        },
        activeNodes: cognitiveState.activeNodes.map(node => ({
          id: node.id,
          content: node.content,
          title: node.title || null,
          node_type: node.node_type,
          relevance_score: node.relevance_score,
          created_at: node.created_at
        })),
        neuralActivation: neural.activationPatterns.map(pattern => ({
          node_id: pattern.node_id,
          activation_strength: pattern.activation_strength,
          propagation_depth: pattern.propagation_depth,
          connected_count: pattern.connected_count,
          last_boost: pattern.last_boost
        })),
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('cognitive_snapshots')
        .insert({
          user_id: user.id,
          name,
          description,
          snapshot_data: snapshotData as any,
          focus_level: cognitiveState.focusLevel,
          cognitive_load: cognitiveState.cognitiveLoad
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('📸 Enhanced cognitive snapshot created:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar snapshot:', error);
      return null;
    }
  }, [user, cognitiveState, neural.activationPatterns]);

  // Process queue for background operations
  const processQueue = useCallback(async () => {
    if (isProcessing || processingQueue.current.length === 0) return;

    setIsProcessing(true);
    const item = processingQueue.current.shift();
    
    if (item) {
      try {
        switch (item.type) {
          case 'generate_insights':
            const insights = await generateProactiveInsights();
            item.resolve(insights);
            break;
          case 'update_connections':
            await updateCognitiveConnections();
            item.resolve();
            break;
          default:
            item.resolve();
        }
      } catch (error) {
        item.reject(error);
      }
    }
    
    setIsProcessing(false);
    
    if (processingQueue.current.length > 0) {
      setTimeout(processQueue, 100);
    }
  }, [isProcessing]);

  // Generate proactive insights
  const generateProactiveInsights = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.functions.invoke('generate-cognitive-insights', {
        body: { userId: user.id }
      });

      if (error) throw error;
      return data.insights || [];
    } catch (error) {
      console.error('❌ Erro ao gerar insights:', error);
      return [];
    }
  }, [user]);

  // Update cognitive connections
  const updateCognitiveConnections = useCallback(async () => {
    console.log('🔗 Atualizando conexões cognitivas...');
  }, []);

  // Load recent cognitive data
  const loadRecentCognitiveData = useCallback(async () => {
    if (!user) return;

    try {
      // Load from active neural network view for better performance
      const activeNodes = await neural.loadActiveNetwork();
      
      // Convert to CognitiveNode format
      const cognitiveNodes: CognitiveNode[] = activeNodes.slice(0, 10).map(node => ({
        id: node.id,
        content: node.content,
        title: node.title,
        node_type: node.node_type,
        relevance_score: node.relevance_score,
        access_count: node.access_count,
        project_id: undefined,
        conversation_id: undefined,
        metadata: node.metadata || {},
        created_at: node.created_at,
        updated_at: node.updated_at
      }));

      // Load recent connections
      const { data: connections, error: connectionsError } = await supabase
        .from('cognitive_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (connectionsError) throw connectionsError;

      setCognitiveState(prev => ({
        ...prev,
        activeNodes: cognitiveNodes,
        recentConnections: connections || []
      }));
    } catch (error) {
      console.error('❌ Erro ao carregar dados cognitivos:', error);
    }
  }, [user, neural]);

  // Initialize cognitive system
  useEffect(() => {
    if (user) {
      loadRecentCognitiveData();
      loadCognitiveInsights();
    }
  }, [user, loadRecentCognitiveData, loadCognitiveInsights]);

  // Process queue periodically
  useEffect(() => {
    const interval = setInterval(processQueue, 1000);
    return () => clearInterval(interval);
  }, [processQueue]);

  return {
    // State
    cognitiveState,
    thoughtModes,
    isProcessing,
    
    // Enhanced functions with neural integration
    createCognitiveNode,
    cognitiveSearch,
    
    // Neural system access
    neural,
    
    // Insights
    loadCognitiveInsights,
    updateInsightStatus,
    
    // Modes and navigation
    switchThoughtMode,
    
    // Snapshots
    createCognitiveSnapshot,
    
    // Data loading
    loadRecentCognitiveData
  };
}

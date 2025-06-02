import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface BlackboardEntry {
  id: string;
  agentType: 'analytical' | 'creative' | 'technical' | 'integration' | 'memory' | 'search';
  content: any;
  priority: number;
  confidence: number;
  timestamp: Date;
  dependencies: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
}

export interface KnowledgeSource {
  id: string;
  type: 'cognitive_node' | 'document' | 'memory' | 'conversation' | 'external';
  data: any;
  relevance: number;
  lastAccessed: Date;
}

export interface ProcessingResult {
  success: boolean;
  result: any;
  agentContributions: Array<{
    agent: string;
    contribution: any;
    confidence: number;
    processingTime: number;
  }>;
  synthesizedInsights: string[];
  qualityScore: number;
  totalProcessingTime: number;
}

export interface BlackboardState {
  entries: BlackboardEntry[];
  knowledgeSources: KnowledgeSource[];
  activeAgents: string[];
  processingQueue: string[];
  globalContext: Record<string, any>;
}

export function useBlackboardSystem() {
  const { user } = useAuth();
  const [blackboardState, setBlackboardState] = useState<BlackboardState>({
    entries: [],
    knowledgeSources: [],
    activeAgents: [],
    processingQueue: [],
    globalContext: {}
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const agentCapabilities = useRef({
    analytical: {
      specializations: ['problem-solving', 'data-analysis', 'logical-reasoning'],
      processingWeight: 0.8,
      confidenceThreshold: 0.7
    },
    creative: {
      specializations: ['ideation', 'design-thinking', 'innovation'],
      processingWeight: 0.7,
      confidenceThreshold: 0.6
    },
    technical: {
      specializations: ['coding', 'architecture', 'optimization'],
      processingWeight: 0.9,
      confidenceThreshold: 0.8
    },
    integration: {
      specializations: ['synthesis', 'pattern-recognition', 'connection-finding'],
      processingWeight: 0.8,
      confidenceThreshold: 0.75
    },
    memory: {
      specializations: ['knowledge-retrieval', 'context-building', 'experience-synthesis'],
      processingWeight: 0.6,
      confidenceThreshold: 0.65
    },
    search: {
      specializations: ['information-gathering', 'source-validation', 'relevance-scoring'],
      processingWeight: 0.7,
      confidenceThreshold: 0.7
    }
  });

  const cooperationPatterns = useRef<Map<string, string[]>>(new Map([
    ['analytical', ['memory', 'search', 'integration']],
    ['creative', ['analytical', 'integration', 'technical']],
    ['technical', ['analytical', 'search', 'integration']],
    ['integration', ['analytical', 'creative', 'memory']],
    ['memory', ['analytical', 'integration', 'search']],
    ['search', ['analytical', 'memory', 'integration']]
  ]));

  // Initialize blackboard system
  const initializeBlackboard = useCallback(async () => {
    if (!user || isInitialized) return;

    try {
      console.log('🏗️ Initializing Blackboard System...');
      
      // Load existing knowledge sources
      const knowledgeSources = await loadKnowledgeSources();
      
      setBlackboardState(prev => ({
        ...prev,
        knowledgeSources,
        globalContext: {
          userId: user.id,
          sessionStartTime: new Date(),
          systemVersion: '1.0.0'
        }
      }));

      setIsInitialized(true);
      console.log('✅ Blackboard System initialized');
    } catch (error) {
      console.error('❌ Error initializing blackboard:', error);
    }
  }, [user, isInitialized]);

  // Load knowledge sources
  const loadKnowledgeSources = useCallback(async (): Promise<KnowledgeSource[]> => {
    if (!user) return [];

    try {
      const sources: KnowledgeSource[] = [];

      // Load cognitive nodes
      const { data: nodes, error: nodesError } = await supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('relevance_score', { ascending: false })
        .limit(50);

      if (nodesError) throw nodesError;

      sources.push(...(nodes || []).map(node => ({
        id: node.id,
        type: 'cognitive_node' as const,
        data: node,
        relevance: node.relevance_score || 0.5,
        lastAccessed: new Date(node.last_accessed_at || node.updated_at)
      })));

      // Load recent conversations
      const { data: conversations, error: convsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (convsError) throw convsError;

      sources.push(...(conversations || []).map(conv => ({
        id: conv.id,
        type: 'conversation' as const,
        data: conv,
        relevance: 0.6,
        lastAccessed: new Date(conv.updated_at)
      })));

      console.log(`📚 Loaded ${sources.length} knowledge sources`);
      return sources;
    } catch (error) {
      console.error('❌ Error loading knowledge sources:', error);
      return [];
    }
  }, [user]);

  // Add entry to blackboard
  const addBlackboardEntry = useCallback((
    agentType: BlackboardEntry['agentType'],
    content: any,
    priority: number = 1,
    confidence: number = 0.7,
    dependencies: string[] = []
  ): string => {
    const entryId = crypto.randomUUID();
    
    const entry: BlackboardEntry = {
      id: entryId,
      agentType,
      content,
      priority,
      confidence,
      timestamp: new Date(),
      dependencies,
      status: 'pending',
      metadata: {}
    };

    setBlackboardState(prev => ({
      ...prev,
      entries: [...prev.entries, entry],
      processingQueue: [...prev.processingQueue, entryId]
    }));

    console.log(`📝 Added blackboard entry: ${agentType} (${entryId})`);
    return entryId;
  }, []);

  // Process entry with specific agent
  const processEntryWithAgent = useCallback(async (
    entryId: string,
    agentType: BlackboardEntry['agentType']
  ): Promise<any> => {
    try {
      console.log(`🤖 Processing entry ${entryId} with ${agentType} agent`);
      
      const entry = blackboardState.entries.find(e => e.id === entryId);
      if (!entry) throw new Error('Entry not found');

      // Update entry status
      setBlackboardState(prev => ({
        ...prev,
        entries: prev.entries.map(e => 
          e.id === entryId ? { ...e, status: 'processing' } : e
        ),
        activeAgents: [...prev.activeAgents.filter(a => a !== agentType), agentType]
      }));

      // Simulate agent processing (in real implementation, this would call LLM)
      const processingResult = await simulateAgentProcessing(entry, agentType);

      // Update entry with result
      setBlackboardState(prev => ({
        ...prev,
        entries: prev.entries.map(e => 
          e.id === entryId ? { 
            ...e, 
            status: 'completed',
            metadata: { ...e.metadata, result: processingResult }
          } : e
        ),
        activeAgents: prev.activeAgents.filter(a => a !== agentType),
        processingQueue: prev.processingQueue.filter(id => id !== entryId)
      }));

      console.log(`✅ Entry ${entryId} processed by ${agentType}`);
      return processingResult;
    } catch (error) {
      console.error(`❌ Error processing entry ${entryId}:`, error);
      
      setBlackboardState(prev => ({
        ...prev,
        entries: prev.entries.map(e => 
          e.id === entryId ? { ...e, status: 'failed' } : e
        ),
        activeAgents: prev.activeAgents.filter(a => a !== agentType)
      }));
      
      throw error;
    }
  }, [blackboardState.entries]);

  // Simulate agent processing (placeholder)
  const simulateAgentProcessing = useCallback(async (
    entry: BlackboardEntry,
    agentType: string
  ): Promise<any> => {
    const capabilities = agentCapabilities.current[agentType as keyof typeof agentCapabilities.current];
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    return {
      agentType,
      processedContent: `Processed by ${agentType}: ${JSON.stringify(entry.content).substring(0, 100)}...`,
      confidence: capabilities.confidenceThreshold + Math.random() * 0.2,
      insights: [`Insight from ${agentType}`, `Analysis by ${agentType}`],
      processingTime: Math.random() * 1000 + 500
    };
  }, []);

  // Cooperative processing with multiple agents
  const processWithBlackboard = useCallback(async (
    input: string,
    context: Record<string, any> = {}
  ): Promise<ProcessingResult> => {
    const startTime = Date.now();
    setIsProcessing(true);

    try {
      console.log('🏗️ Starting blackboard cooperative processing...');
      
      // Determine which agents should participate
      const participatingAgents = determineParticipatingAgents(input, context);
      
      // Create initial entries for each agent
      const entryIds = participatingAgents.map(agentType => 
        addBlackboardEntry(agentType, { input, context }, 1, 0.7)
      );

      // Process entries cooperatively
      const agentContributions = await Promise.all(
        entryIds.map(async (entryId, index) => {
          const agentType = participatingAgents[index];
          const result = await processEntryWithAgent(entryId, agentType);
          
          return {
            agent: agentType,
            contribution: result,
            confidence: result.confidence,
            processingTime: result.processingTime
          };
        })
      );

      // Synthesize results
      const synthesizedResult = await synthesizeContributions(agentContributions, input);
      
      const totalProcessingTime = Date.now() - startTime;
      
      const result: ProcessingResult = {
        success: true,
        result: synthesizedResult,
        agentContributions,
        synthesizedInsights: synthesizedResult.insights || [],
        qualityScore: calculateQualityScore(agentContributions),
        totalProcessingTime
      };

      console.log(`✅ Blackboard processing completed in ${totalProcessingTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Error in blackboard processing:', error);
      return {
        success: false,
        result: { error: error.message },
        agentContributions: [],
        synthesizedInsights: [],
        qualityScore: 0,
        totalProcessingTime: Date.now() - startTime
      };
    } finally {
      setIsProcessing(false);
    }
  }, [addBlackboardEntry, processEntryWithAgent]);

  // Determine participating agents based on input
  const determineParticipatingAgents = useCallback((
    input: string,
    context: Record<string, any>
  ): Array<BlackboardEntry['agentType']> => {
    const agents: Array<BlackboardEntry['agentType']> = ['integration']; // Always include integration
    
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('analis') || inputLower.includes('problema') || inputLower.includes('dados')) {
      agents.push('analytical');
    }
    
    if (inputLower.includes('criat') || inputLower.includes('design') || inputLower.includes('ideia')) {
      agents.push('creative');
    }
    
    if (inputLower.includes('código') || inputLower.includes('técnic') || inputLower.includes('implementa')) {
      agents.push('technical');
    }
    
    if (inputLower.includes('lembr') || inputLower.includes('memória') || inputLower.includes('anterior')) {
      agents.push('memory');
    }
    
    if (inputLower.includes('pesquis') || inputLower.includes('busca') || inputLower.includes('informação')) {
      agents.push('search');
    }
    
    return [...new Set(agents)]; // Remove duplicates
  }, []);

  // Synthesize contributions from multiple agents
  const synthesizeContributions = useCallback(async (
    contributions: any[],
    originalInput: string
  ): Promise<any> => {
    console.log('🔄 Synthesizing agent contributions...');
    
    // Simple synthesis - combine insights and find common themes
    const allInsights = contributions.flatMap(c => c.contribution.insights || []);
    const avgConfidence = contributions.reduce((sum, c) => sum + c.confidence, 0) / contributions.length;
    
    const synthesized = {
      originalInput,
      combinedResponse: contributions.map(c => c.contribution.processedContent).join('\n\n'),
      insights: [...new Set(allInsights)],
      confidence: avgConfidence,
      participatingAgents: contributions.map(c => c.agent),
      synthesisQuality: avgConfidence > 0.7 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low'
    };
    
    return synthesized;
  }, []);

  // Calculate overall quality score
  const calculateQualityScore = useCallback((contributions: any[]): number => {
    if (contributions.length === 0) return 0;
    
    const avgConfidence = contributions.reduce((sum, c) => sum + c.confidence, 0) / contributions.length;
    const diversityBonus = contributions.length >= 3 ? 0.1 : 0;
    const consistencyBonus = contributions.every(c => c.confidence > 0.6) ? 0.1 : 0;
    
    return Math.min(1.0, avgConfidence + diversityBonus + consistencyBonus);
  }, []);

  // Get blackboard status
  const getBlackboardStatus = useCallback(() => {
    return {
      isInitialized,
      isProcessing,
      totalEntries: blackboardState.entries.length,
      pendingEntries: blackboardState.entries.filter(e => e.status === 'pending').length,
      processingEntries: blackboardState.entries.filter(e => e.status === 'processing').length,
      completedEntries: blackboardState.entries.filter(e => e.status === 'completed').length,
      activeAgents: blackboardState.activeAgents,
      knowledgeSourcesCount: blackboardState.knowledgeSources.length,
      queueLength: blackboardState.processingQueue.length
    };
  }, [isInitialized, isProcessing, blackboardState]);

  // Initialize on mount
  useEffect(() => {
    if (user && !isInitialized) {
      initializeBlackboard();
    }
  }, [user, isInitialized, initializeBlackboard]);

  // Clear blackboard
  const clearBlackboard = useCallback(() => {
    setBlackboardState(prev => ({
      ...prev,
      entries: [],
      processingQueue: []
    }));
  }, []);

  // Get recent entries
  const getRecentEntries = useCallback(() => {
    return blackboardState.entries.filter(e => e.status === 'completed').slice(0, 10);
  }, [blackboardState.entries]);

  // Initialize knowledge sources
  const initializeKnowledgeSources = useCallback(() => {
    console.log('🚀 Initializing knowledge sources...');
    // Implementation for initialization
  }, []);

  return {
    // Core functions
    processWithBlackboard,
    addBlackboardEntry,
    getBlackboardStatus,
    
    // State
    isInitialized,
    isProcessing,
    
    // Blackboard management
    clearBlackboard,
    getRecentEntries,
    initializeKnowledgeSources
  };
}

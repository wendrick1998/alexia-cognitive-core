
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Agent {
  id: string;
  name: string;
  type: 'analytical' | 'creative' | 'technical' | 'coordination' | 'quality_assurance';
  capabilities: string[];
  specializations: string[];
  currentTask?: string;
  status: 'idle' | 'working' | 'collaborating' | 'reviewing';
  workload: number; // 0-1
  performance: {
    tasksCompleted: number;
    averageQuality: number;
    collaborationScore: number;
    learningRate: number;
  };
}

export interface Collaboration {
  id: string;
  taskId: string;
  participants: string[]; // Agent IDs
  type: 'peer_review' | 'joint_problem_solving' | 'knowledge_sharing' | 'conflict_resolution';
  status: 'active' | 'completed' | 'paused';
  startTime: Date;
  endTime?: Date;
  outcomes: {
    consensusReached: boolean;
    qualityImprovement: number;
    knowledgeTransferred: string[];
    conflictsResolved: number;
  };
}

export interface KnowledgeExchange {
  from: string;
  to: string;
  topic: string;
  knowledge: any;
  transferType: 'explicit' | 'tacit' | 'procedural';
  confidence: number;
  timestamp: Date;
}

export function useMultiAgentCollaboration() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'analytical-agent',
      name: 'Alex Analytics',
      type: 'analytical',
      capabilities: ['data_analysis', 'pattern_recognition', 'statistical_modeling'],
      specializations: ['business_intelligence', 'predictive_analysis'],
      status: 'idle',
      workload: 0,
      performance: {
        tasksCompleted: 0,
        averageQuality: 0.8,
        collaborationScore: 0.75,
        learningRate: 0.12
      }
    },
    {
      id: 'creative-agent',
      name: 'Creative Catalyst',
      type: 'creative',
      capabilities: ['ideation', 'design_thinking', 'content_creation'],
      specializations: ['ui_design', 'copywriting', 'brainstorming'],
      status: 'idle',
      workload: 0,
      performance: {
        tasksCompleted: 0,
        averageQuality: 0.85,
        collaborationScore: 0.9,
        learningRate: 0.15
      }
    },
    {
      id: 'technical-agent',
      name: 'Tech Titan',
      type: 'technical',
      capabilities: ['code_analysis', 'architecture_design', 'debugging'],
      specializations: ['backend_development', 'devops', 'security'],
      status: 'idle',
      workload: 0,
      performance: {
        tasksCompleted: 0,
        averageQuality: 0.9,
        collaborationScore: 0.7,
        learningRate: 0.1
      }
    }
  ]);

  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [knowledgeExchanges, setKnowledgeExchanges] = useState<KnowledgeExchange[]>([]);

  const blackboard = useRef<Map<string, {
    topic: string;
    data: any;
    contributors: string[];
    lastUpdated: Date;
    confidence: number;
  }>>(new Map());

  // Assign task to best suited agent
  const assignTask = useCallback((
    taskId: string,
    taskType: string,
    requirements: string[],
    priority: number = 1
  ): string | null => {
    console.log(`🎯 Assigning task ${taskId} of type ${taskType}`);

    // Score agents based on capabilities and current workload
    const agentScores = agents.map(agent => {
      let score = 0;
      
      // Capability match
      const capabilityMatch = requirements.filter(req => 
        agent.capabilities.includes(req) || agent.specializations.includes(req)
      ).length / requirements.length;
      
      score += capabilityMatch * 0.4;
      
      // Performance history
      score += agent.performance.averageQuality * 0.3;
      
      // Workload (prefer less busy agents)
      score += (1 - agent.workload) * 0.2;
      
      // Learning opportunity (prefer agents that can learn from this task)
      if (requirements.some(req => !agent.capabilities.includes(req))) {
        score += agent.performance.learningRate * 0.1;
      }

      return { agent, score };
    });

    // Sort by score and select best available agent
    agentScores.sort((a, b) => b.score - a.score);
    const selectedAgent = agentScores.find(({ agent }) => agent.status === 'idle')?.agent;

    if (selectedAgent) {
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id 
          ? { 
              ...agent, 
              status: 'working', 
              currentTask: taskId,
              workload: Math.min(1, agent.workload + (priority * 0.3))
            }
          : agent
      ));

      console.log(`✅ Task assigned to ${selectedAgent.name}`);
      return selectedAgent.id;
    }

    console.log('❌ No available agent found');
    return null;
  }, [agents]);

  // Initiate collaboration between agents
  const initiateCollaboration = useCallback((
    taskId: string,
    agentIds: string[],
    collaborationType: Collaboration['type']
  ): string => {
    const collaborationId = crypto.randomUUID();
    
    const newCollaboration: Collaboration = {
      id: collaborationId,
      taskId,
      participants: agentIds,
      type: collaborationType,
      status: 'active',
      startTime: new Date(),
      outcomes: {
        consensusReached: false,
        qualityImprovement: 0,
        knowledgeTransferred: [],
        conflictsResolved: 0
      }
    };

    setCollaborations(prev => [...prev, newCollaboration]);

    // Update agent status
    setAgents(prev => prev.map(agent => 
      agentIds.includes(agent.id) 
        ? { ...agent, status: 'collaborating' }
        : agent
    ));

    console.log(`🤝 Collaboration ${collaborationId} initiated between agents: ${agentIds.join(', ')}`);
    
    toast({
      title: "Colaboração Iniciada",
      description: `${agentIds.length} agentes estão colaborando na tarefa`,
    });

    return collaborationId;
  }, [toast]);

  // Share knowledge between agents via blackboard
  const shareKnowledge = useCallback((
    fromAgentId: string,
    toAgentId: string,
    topic: string,
    knowledge: any,
    transferType: KnowledgeExchange['transferType'] = 'explicit'
  ) => {
    const exchange: KnowledgeExchange = {
      from: fromAgentId,
      to: toAgentId,
      topic,
      knowledge,
      transferType,
      confidence: 0.8, // Base confidence
      timestamp: new Date()
    };

    setKnowledgeExchanges(prev => [...prev, exchange]);

    // Update blackboard
    const blackboardKey = `${topic}_${fromAgentId}`;
    blackboard.current.set(blackboardKey, {
      topic,
      data: knowledge,
      contributors: [fromAgentId],
      lastUpdated: new Date(),
      confidence: 0.8
    });

    // Update receiving agent's capabilities if applicable
    if (transferType === 'procedural') {
      setAgents(prev => prev.map(agent => 
        agent.id === toAgentId 
          ? {
              ...agent,
              capabilities: [...new Set([...agent.capabilities, topic])],
              performance: {
                ...agent.performance,
                learningRate: Math.min(1, agent.performance.learningRate + 0.02)
              }
            }
          : agent
      ));
    }

    console.log(`📚 Knowledge "${topic}" shared from ${fromAgentId} to ${toAgentId}`);
  }, []);

  // Resolve conflicts through consensus building
  const resolveConflict = useCallback((
    collaborationId: string,
    conflictingViewpoints: Array<{ agentId: string; viewpoint: any; confidence: number }>
  ): any => {
    console.log(`⚖️ Resolving conflict in collaboration ${collaborationId}`);

    // Weighted voting based on agent performance and confidence
    let totalWeight = 0;
    let weightedSum: any = {};

    conflictingViewpoints.forEach(({ agentId, viewpoint, confidence }) => {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        const weight = agent.performance.averageQuality * confidence;
        totalWeight += weight;
        
        // Simple weighted average for numeric values
        Object.keys(viewpoint).forEach(key => {
          if (typeof viewpoint[key] === 'number') {
            weightedSum[key] = (weightedSum[key] || 0) + (viewpoint[key] * weight);
          }
        });
      }
    });

    // Normalize by total weight
    Object.keys(weightedSum).forEach(key => {
      weightedSum[key] /= totalWeight;
    });

    // Update collaboration outcome
    setCollaborations(prev => prev.map(collab => 
      collab.id === collaborationId
        ? {
            ...collab,
            outcomes: {
              ...collab.outcomes,
              consensusReached: true,
              conflictsResolved: collab.outcomes.conflictsResolved + 1
            }
          }
        : collab
    ));

    console.log('✅ Conflict resolved through weighted consensus');
    return weightedSum;
  }, [agents]);

  // Update agent performance based on task completion
  const updateAgentPerformance = useCallback((
    agentId: string,
    taskResult: {
      quality: number;
      timeliness: number;
      collaboration: number;
    }
  ) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId
        ? {
            ...agent,
            status: 'idle',
            currentTask: undefined,
            workload: Math.max(0, agent.workload - 0.3),
            performance: {
              tasksCompleted: agent.performance.tasksCompleted + 1,
              averageQuality: (agent.performance.averageQuality * 0.8) + (taskResult.quality * 0.2),
              collaborationScore: (agent.performance.collaborationScore * 0.8) + (taskResult.collaboration * 0.2),
              learningRate: agent.performance.learningRate
            }
          }
        : agent
    ));

    console.log(`📊 Updated performance for agent ${agentId}`);
  }, []);

  // Get collaborative recommendations
  const getCollaborativeRecommendations = useCallback((taskId: string, taskComplexity: number) => {
    if (taskComplexity < 0.3) {
      return {
        shouldCollaborate: false,
        reason: 'Task is simple enough for single agent',
        recommendedAgents: []
      };
    }

    if (taskComplexity > 0.7) {
      // High complexity - recommend multi-agent collaboration
      const availableAgents = agents.filter(agent => agent.status === 'idle');
      const diverseAgents = availableAgents
        .filter((agent, index, arr) => 
          arr.findIndex(a => a.type === agent.type) === index
        )
        .slice(0, 3);

      return {
        shouldCollaborate: true,
        reason: 'High complexity task benefits from diverse perspectives',
        recommendedAgents: diverseAgents.map(a => a.id),
        collaborationType: 'joint_problem_solving' as const
      };
    }

    return {
      shouldCollaborate: true,
      reason: 'Medium complexity - peer review recommended',
      recommendedAgents: agents.filter(a => a.status === 'idle').slice(0, 2).map(a => a.id),
      collaborationType: 'peer_review' as const
    };
  }, [agents]);

  return {
    // State
    agents,
    collaborations,
    knowledgeExchanges,
    blackboardData: Object.fromEntries(blackboard.current),

    // Core functions
    assignTask,
    initiateCollaboration,
    shareKnowledge,
    resolveConflict,
    updateAgentPerformance,
    getCollaborativeRecommendations,

    // Analytics
    collaborationStats: {
      activeCollaborations: collaborations.filter(c => c.status === 'active').length,
      totalKnowledgeExchanges: knowledgeExchanges.length,
      averageAgentWorkload: agents.reduce((sum, a) => sum + a.workload, 0) / agents.length,
      topPerformingAgent: agents.reduce((best, current) => 
        current.performance.averageQuality > best.performance.averageQuality ? current : best
      )
    }
  };
}

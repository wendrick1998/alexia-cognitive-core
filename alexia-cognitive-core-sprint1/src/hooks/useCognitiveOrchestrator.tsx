
import { useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface AgentCapability {
  name: string;
  description: string;
  specialization: string[];
  available: boolean;
}

export interface CognitiveTask {
  id: string;
  type: 'analysis' | 'creative' | 'technical' | 'integration';
  content: string;
  priority: number;
  complexity: number;
  requiredAgents: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
}

export interface OrchestrationResult {
  success: boolean;
  result: any;
  insights: string[];
  connectionsFound: number;
  processingTime: number;
}

export function useCognitiveOrchestrator() {
  const { user } = useAuth();
  const taskQueue = useRef<CognitiveTask[]>([]);
  const processing = useRef<boolean>(false);

  // Available cognitive agents
  const agents: AgentCapability[] = [
    {
      name: 'analytical-agent',
      description: 'Agente Analítico - Especializado em análise profunda e raciocínio lógico',
      specialization: ['problem-solving', 'data-analysis', 'logical-reasoning', 'requirement-analysis'],
      available: true
    },
    {
      name: 'creative-agent',
      description: 'Agente Criativo - Focado em design, UX e soluções inovadoras',
      specialization: ['design', 'user-experience', 'innovation', 'brainstorming', 'visual-thinking'],
      available: true
    },
    {
      name: 'technical-agent',
      description: 'Agente Técnico - Mestre em código, arquitetura e implementação',
      specialization: ['coding', 'architecture', 'debugging', 'optimization', 'best-practices'],
      available: true
    },
    {
      name: 'integration-agent',
      description: 'Agente Integrador - Conecta informações e gera insights',
      specialization: ['pattern-recognition', 'synthesis', 'connection-finding', 'insight-generation'],
      available: true
    }
  ];

  // Deep intention analysis
  const analyzeIntention = useCallback(async (input: string, context: any = {}) => {
    console.log('🎯 Analisando intenção profunda...');
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-deep-intention', {
        body: {
          input,
          context,
          userId: user?.id
        }
      });

      if (error) throw error;

      return {
        explicitIntent: data.explicitIntent,
        implicitNeeds: data.implicitNeeds,
        emotionalContext: data.emotionalContext,
        urgencyLevel: data.urgencyLevel,
        complexity: data.complexity,
        suggestedAgents: data.suggestedAgents,
        anticipatedNeeds: data.anticipatedNeeds
      };
    } catch (error) {
      console.error('❌ Erro na análise de intenção:', error);
      return {
        explicitIntent: input,
        implicitNeeds: [],
        emotionalContext: 'neutral',
        urgencyLevel: 'medium',
        complexity: 0.5,
        suggestedAgents: ['analytical-agent'],
        anticipatedNeeds: []
      };
    }
  }, [user]);

  // Create adaptive execution plan
  const createExecutionPlan = useCallback((intention: any, availableAgents: AgentCapability[]) => {
    console.log('📋 Criando plano de execução adaptativo...');
    
    const plan = {
      taskId: crypto.randomUUID(),
      complexity: intention.complexity,
      estimatedSteps: Math.ceil(intention.complexity * 5),
      requiredAgents: intention.suggestedAgents,
      parallelExecution: intention.complexity > 0.7,
      checkpoints: [],
      fallbackPlans: [],
      expectedDuration: intention.complexity * 30 // seconds
    };

    // Create checkpoints based on complexity
    if (plan.complexity > 0.5) {
      plan.checkpoints = [
        { step: Math.floor(plan.estimatedSteps * 0.25), validation: 'initial-analysis' },
        { step: Math.floor(plan.estimatedSteps * 0.5), validation: 'mid-process-review' },
        { step: Math.floor(plan.estimatedSteps * 0.75), validation: 'pre-synthesis' }
      ];
    }

    // Create fallback plans
    plan.fallbackPlans = [
      { trigger: 'agent-unavailable', action: 'route-to-available-agent' },
      { trigger: 'complexity-exceeded', action: 'break-into-subtasks' },
      { trigger: 'timeout', action: 'partial-result-with-continuation' }
    ];

    console.log('✅ Plano criado:', plan);
    return plan;
  }, []);

  // Smart LLM router with learning
  const routeToOptimalLLM = useCallback(async (task: CognitiveTask, agentType: string) => {
    console.log('🧠 Roteando para LLM otimizado...');
    
    try {
      const { data, error } = await supabase.functions.invoke('route-optimal-llm', {
        body: {
          task,
          agentType,
          userId: user?.id
        }
      });

      if (error) throw error;

      return {
        selectedModel: data.selectedModel,
        confidence: data.confidence,
        reasoning: data.reasoning,
        estimatedQuality: data.estimatedQuality,
        estimatedSpeed: data.estimatedSpeed,
        estimatedCost: data.estimatedCost
      };
    } catch (error) {
      console.error('❌ Erro no roteamento de LLM:', error);
      return {
        selectedModel: 'gpt-4o-mini', // fallback
        confidence: 0.5,
        reasoning: 'Fallback to default model',
        estimatedQuality: 0.7,
        estimatedSpeed: 0.8,
        estimatedCost: 0.3
      };
    }
  }, [user]);

  // Execute task with specific agent
  const executeWithAgent = useCallback(async (
    task: CognitiveTask, 
    agentName: string,
    llmRoute: any
  ) => {
    console.log(`🤖 Executando com agente: ${agentName}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('execute-cognitive-agent', {
        body: {
          task,
          agentName,
          llmRoute,
          userId: user?.id
        }
      });

      if (error) throw error;

      return {
        success: true,
        result: data.result,
        agentUsed: agentName,
        modelUsed: llmRoute.selectedModel,
        processingTime: data.processingTime,
        qualityScore: data.qualityScore,
        insights: data.insights || []
      };
    } catch (error) {
      console.error(`❌ Erro na execução do agente ${agentName}:`, error);
      return {
        success: false,
        result: null,
        agentUsed: agentName,
        modelUsed: llmRoute.selectedModel,
        processingTime: 0,
        qualityScore: 0,
        insights: []
      };
    }
  }, [user]);

  // Orchestrate complete cognitive process
  const orchestrateCognitiveProcess = useCallback(async (
    input: string,
    context: any = {}
  ): Promise<OrchestrationResult> => {
    const startTime = Date.now();
    console.log('🎭 Iniciando orquestração cognitiva completa...');

    try {
      // Step 1: Deep intention analysis
      const intention = await analyzeIntention(input, context);
      console.log('📊 Intenção analisada:', intention);

      // Step 2: Create execution plan
      const plan = createExecutionPlan(intention, agents);

      // Step 3: Execute with appropriate agents
      const results = [];
      let totalConnections = 0;

      for (const agentName of plan.requiredAgents) {
        const agent = agents.find(a => a.name === agentName);
        if (!agent || !agent.available) continue;

        // Create task for this agent
        const task: CognitiveTask = {
          id: crypto.randomUUID(),
          type: agentName.includes('analytical') ? 'analysis' :
                agentName.includes('creative') ? 'creative' :
                agentName.includes('technical') ? 'technical' : 'integration',
          content: input,
          priority: intention.urgencyLevel === 'high' ? 3 : intention.urgencyLevel === 'low' ? 1 : 2,
          complexity: intention.complexity,
          requiredAgents: [agentName],
          status: 'pending'
        };

        // Route to optimal LLM
        const llmRoute = await routeToOptimalLLM(task, agentName);

        // Execute with agent
        const result = await executeWithAgent(task, agentName, llmRoute);
        results.push(result);

        if (result.success && result.insights) {
          totalConnections += result.insights.length;
        }
      }

      // Step 4: Synthesize results
      const synthesizedResult = await synthesizeResults(results, intention);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Orquestração completa em ${processingTime}ms`);

      return {
        success: true,
        result: synthesizedResult,
        insights: synthesizedResult.insights || [],
        connectionsFound: totalConnections,
        processingTime
      };

    } catch (error) {
      console.error('❌ Erro na orquestração cognitiva:', error);
      return {
        success: false,
        result: { message: 'Erro no processamento cognitivo', error: error.message },
        insights: [],
        connectionsFound: 0,
        processingTime: Date.now() - startTime
      };
    }
  }, [analyzeIntention, createExecutionPlan, routeToOptimalLLM, executeWithAgent]);

  // Synthesize results from multiple agents
  const synthesizeResults = useCallback(async (results: any[], intention: any) => {
    console.log('🔄 Sintetizando resultados de múltiplos agentes...');

    try {
      const { data, error } = await supabase.functions.invoke('synthesize-agent-results', {
        body: {
          results,
          intention,
          userId: user?.id
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Erro na síntese:', error);
      
      // Fallback synthesis
      const successfulResults = results.filter(r => r.success);
      return {
        message: successfulResults.map(r => r.result).join('\n\n'),
        insights: successfulResults.flatMap(r => r.insights || []),
        agentsUsed: successfulResults.map(r => r.agentUsed),
        qualityScore: successfulResults.reduce((acc, r) => acc + r.qualityScore, 0) / successfulResults.length
      };
    }
  }, [user]);

  // Process command with cognitive capabilities
  const processCognitiveCommand = useCallback(async (command: string, input: string, context: any = {}) => {
    console.log(`🎯 Processando comando cognitivo: ${command}`);

    switch (command) {
      case 'deep-think':
        return await orchestrateCognitiveProcess(input, { ...context, mode: 'deep-analysis' });
      
      case 'connect':
        return await orchestrateCognitiveProcess(input, { ...context, mode: 'connection-finding' });
      
      case 'evolve':
        return await orchestrateCognitiveProcess(input, { ...context, mode: 'evolution-analysis' });
      
      case 'simulate':
        return await orchestrateCognitiveProcess(input, { ...context, mode: 'scenario-simulation' });
      
      default:
        return await orchestrateCognitiveProcess(input, context);
    }
  }, [orchestrateCognitiveProcess]);

  return {
    // Available agents
    agents,
    
    // Core orchestration
    orchestrateCognitiveProcess,
    processCognitiveCommand,
    
    // Individual components
    analyzeIntention,
    createExecutionPlan,
    routeToOptimalLLM,
    
    // State
    processing: processing.current,
    taskQueue: taskQueue.current
  };
}

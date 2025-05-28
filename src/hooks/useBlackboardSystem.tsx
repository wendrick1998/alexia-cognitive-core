
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Comlink from 'comlink';

interface BlackboardEntry {
  id: string;
  type: 'hypothesis' | 'fact' | 'goal' | 'constraint' | 'solution';
  content: any;
  confidence: number;
  source: string;
  timestamp: number;
  dependencies: string[];
}

interface KnowledgeSource {
  id: string;
  name: string;
  worker?: Comlink.Remote<any>;
  capabilities: string[];
  isActive: boolean;
  currentTask?: string;
}

interface BlackboardState {
  entries: BlackboardEntry[];
  activeKS: string[];
  currentFocus: string | null;
  processingQueue: string[];
}

export function useBlackboardSystem() {
  const [blackboard, setBlackboard] = useState<BlackboardState>({
    entries: [],
    activeKS: [],
    currentFocus: null,
    processingQueue: []
  });

  const knowledgeSources = useRef<Map<string, KnowledgeSource>>(new Map());
  const isInitialized = useRef(false);

  // Initialize Web Workers
  const initializeKnowledgeSources = useCallback(async () => {
    if (isInitialized.current) return;

    try {
      console.log('🚀 Initializing Blackboard System with Web Workers...');

      // Initialize Analytical Agent
      const analyticalWorker = new Worker(
        new URL('../workers/AnalyticalAgent.worker.ts', import.meta.url),
        { type: 'module' }
      );
      const analyticalAgent = Comlink.wrap(analyticalWorker);

      knowledgeSources.current.set('analytical', {
        id: 'analytical',
        name: 'Analytical Agent',
        worker: analyticalAgent,
        capabilities: ['logical-reasoning', 'pattern-analysis', 'causal-inference'],
        isActive: true
      });

      // Initialize Creative Agent
      const creativeWorker = new Worker(
        new URL('../workers/CreativeAgent.worker.ts', import.meta.url),
        { type: 'module' }
      );
      const creativeAgent = Comlink.wrap(creativeWorker);

      knowledgeSources.current.set('creative', {
        id: 'creative',
        name: 'Creative Agent',
        worker: creativeAgent,
        capabilities: ['lateral-thinking', 'innovation', 'design-thinking'],
        isActive: true
      });

      // Initialize Critical Agent
      const criticalWorker = new Worker(
        new URL('../workers/CriticalAgent.worker.ts', import.meta.url),
        { type: 'module' }
      );
      const criticalAgent = Comlink.wrap(criticalWorker);

      knowledgeSources.current.set('critical', {
        id: 'critical',
        name: 'Critical Agent',
        worker: criticalAgent,
        capabilities: ['validation', 'critique', 'improvement'],
        isActive: true
      });

      // Initialize Integrator Agent
      const integratorWorker = new Worker(
        new URL('../workers/IntegratorAgent.worker.ts', import.meta.url),
        { type: 'module' }
      );
      const integratorAgent = Comlink.wrap(integratorWorker);

      knowledgeSources.current.set('integrator', {
        id: 'integrator',
        name: 'Integrator Agent',
        worker: integratorAgent,
        capabilities: ['synthesis', 'integration', 'coherence'],
        isActive: true
      });

      isInitialized.current = true;
      console.log('✅ Blackboard System initialized with 4 Knowledge Sources');

    } catch (error) {
      console.error('❌ Failed to initialize Blackboard System:', error);
    }
  }, []);

  // Add entry to blackboard
  const addToBlackboard = useCallback((entry: Omit<BlackboardEntry, 'id' | 'timestamp'>) => {
    const newEntry: BlackboardEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    setBlackboard(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }));

    return newEntry.id;
  }, []);

  // Process task with appropriate Knowledge Sources
  const processWithBlackboard = useCallback(async (
    content: string,
    context: any = {},
    requiredCapabilities: string[] = []
  ) => {
    if (!isInitialized.current) {
      await initializeKnowledgeSources();
    }

    const taskId = crypto.randomUUID();
    
    console.log(`🎯 Blackboard processing task: ${taskId}`);
    
    // Add initial hypothesis to blackboard
    addToBlackboard({
      type: 'hypothesis',
      content: { originalRequest: content, context },
      confidence: 0.5,
      source: 'user',
      dependencies: []
    });

    // Determine which Knowledge Sources to activate
    const relevantKS = Array.from(knowledgeSources.current.values()).filter(ks => {
      if (requiredCapabilities.length === 0) return true;
      return requiredCapabilities.some(cap => ks.capabilities.includes(cap));
    });

    console.log(`📊 Activating ${relevantKS.length} Knowledge Sources:`, relevantKS.map(ks => ks.name));

    // Create task for each Knowledge Source
    const task = {
      id: taskId,
      content,
      context,
      priority: 2,
      complexity: Math.min(content.length / 200, 1.0)
    };

    // Execute tasks in parallel
    const results = await Promise.allSettled(
      relevantKS.slice(0, 3).map(async (ks) => { // Limit to first 3 to avoid overload
        if (!ks.worker) return null;
        
        try {
          console.log(`🔄 ${ks.name} starting processing...`);
          const result = await ks.worker.processTask(task);
          
          // Add result to blackboard
          addToBlackboard({
            type: 'fact',
            content: result,
            confidence: result.confidence || 0.7,
            source: ks.id,
            dependencies: [taskId]
          });
          
          return { ksId: ks.id, result };
        } catch (error) {
          console.error(`❌ Error in ${ks.name}:`, error);
          return null;
        }
      })
    );

    // Collect successful results
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);

    console.log(`✅ Collected ${successfulResults.length} results from Knowledge Sources`);

    // Integrate results using Integrator Agent
    if (successfulResults.length > 1) {
      const integratorKS = knowledgeSources.current.get('integrator');
      if (integratorKS?.worker) {
        try {
          const integrationTask = {
            ...task,
            agentResults: successfulResults.map(r => r.result)
          };
          
          const integratedResult = await integratorKS.worker.processTask(integrationTask);
          
          // Add final solution to blackboard
          addToBlackboard({
            type: 'solution',
            content: integratedResult,
            confidence: integratedResult.confidence || 0.8,
            source: 'integrator',
            dependencies: successfulResults.map(r => r.ksId)
          });

          return {
            success: true,
            result: integratedResult,
            partialResults: successfulResults,
            taskId
          };
        } catch (error) {
          console.error('❌ Integration failed:', error);
        }
      }
    }

    // Return best single result if integration failed
    const bestResult = successfulResults.reduce((best, current) => {
      const bestScore = best?.result?.confidence || 0;
      const currentScore = current?.result?.confidence || 0;
      return currentScore > bestScore ? current : best;
    }, null);

    return {
      success: bestResult !== null,
      result: bestResult?.result || { result: 'Processamento falhou', confidence: 0 },
      partialResults: successfulResults,
      taskId
    };
  }, [addToBlackboard, initializeKnowledgeSources]);

  // Get blackboard status
  const getBlackboardStatus = useCallback(() => {
    const ksArray = Array.from(knowledgeSources.current.values());
    
    return {
      totalEntries: blackboard.entries.length,
      activeKnowledgeSources: ksArray.filter(ks => ks.isActive).length,
      recentEntries: blackboard.entries.slice(-5),
      knowledgeSources: ksArray.map(ks => ({
        id: ks.id,
        name: ks.name,
        capabilities: ks.capabilities,
        isActive: ks.isActive
      }))
    };
  }, [blackboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      knowledgeSources.current.forEach(ks => {
        if (ks.worker && 'terminate' in ks.worker) {
          (ks.worker as any).terminate?.();
        }
      });
    };
  }, []);

  return {
    blackboard,
    processWithBlackboard,
    addToBlackboard,
    getBlackboardStatus,
    initializeKnowledgeSources,
    isInitialized: isInitialized.current
  };
}

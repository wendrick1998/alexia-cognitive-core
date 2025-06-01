
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface LearningPattern {
  id: string;
  pattern: any[];
  frequency: number;
  confidence: number;
  lastSeen: Date;
  context: string;
}

export interface UserPreference {
  feature: string;
  preference: number; // -1 to 1
  confidence: number;
  lastUpdated: Date;
  context: string[];
}

export interface MetaLearningConfig {
  learningRate: number;
  explorationRate: number;
  adaptationSpeed: number;
  patternSensitivity: number;
}

export interface Anomaly {
  id: string;
  type: 'behavioral' | 'performance' | 'pattern';
  description: string;
  severity: number;
  timestamp: Date;
  context: any;
}

export function useAutonomousLearning() {
  const { user } = useAuth();
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [metaConfig, setMetaConfig] = useState<MetaLearningConfig>({
    learningRate: 0.1,
    explorationRate: 0.2,
    adaptationSpeed: 0.15,
    patternSensitivity: 0.7
  });

  const behaviorData = useRef<Array<{
    action: string;
    timestamp: Date;
    context: any;
    outcome: 'positive' | 'negative' | 'neutral';
    duration: number;
  }>>([]);

  const banditArms = useRef<Map<string, {
    pulls: number;
    rewards: number;
    confidence: number;
    lastPull: Date;
  }>>(new Map());

  // Multi-Armed Bandit for exploration/exploitation
  const selectAction = useCallback((availableActions: string[], context: any = {}): string => {
    if (availableActions.length === 0) return '';

    const explore = Math.random() < metaConfig.explorationRate;
    
    if (explore || banditArms.current.size === 0) {
      // Exploration: random selection
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }

    // Exploitation: UCB1 algorithm
    const now = Date.now();
    let bestAction = availableActions[0];
    let bestScore = -Infinity;

    for (const action of availableActions) {
      const arm = banditArms.current.get(action);
      if (!arm) {
        // Unknown action, prioritize exploration
        return action;
      }

      const meanReward = arm.rewards / arm.pulls;
      const confidence = Math.sqrt((2 * Math.log(now - arm.lastPull.getTime())) / arm.pulls);
      const ucbScore = meanReward + confidence;

      if (ucbScore > bestScore) {
        bestScore = ucbScore;
        bestAction = action;
      }
    }

    return bestAction;
  }, [metaConfig.explorationRate]);

  // Update bandit arm based on feedback
  const updateActionFeedback = useCallback((
    action: string, 
    reward: number, 
    context: any = {}
  ) => {
    const arm = banditArms.current.get(action) || {
      pulls: 0,
      rewards: 0,
      confidence: 0,
      lastPull: new Date()
    };

    arm.pulls += 1;
    arm.rewards += reward;
    arm.confidence = arm.rewards / arm.pulls;
    arm.lastPull = new Date();

    banditArms.current.set(action, arm);

    // Record behavior data
    behaviorData.current.push({
      action,
      timestamp: new Date(),
      context,
      outcome: reward > 0.5 ? 'positive' : reward < -0.5 ? 'negative' : 'neutral',
      duration: 0 // Would be set by calling code
    });

    // Limit behavior data size
    if (behaviorData.current.length > 1000) {
      behaviorData.current = behaviorData.current.slice(-1000);
    }

    console.log(`🎯 Updated bandit arm "${action}": ${arm.confidence.toFixed(3)} confidence`);
  }, []);

  // FP-Growth algorithm for frequent pattern mining
  const mineFrequentPatterns = useCallback((minSupport: number = 0.1): LearningPattern[] => {
    if (behaviorData.current.length < 10) return [];

    // Simplified FP-Growth implementation
    const sequences = behaviorData.current
      .slice(-100) // Last 100 actions
      .map(item => item.action);

    const patternCounts = new Map<string, number>();
    const maxPatternLength = 5;

    // Generate patterns of different lengths
    for (let length = 2; length <= maxPatternLength; length++) {
      for (let i = 0; i <= sequences.length - length; i++) {
        const pattern = sequences.slice(i, i + length);
        const patternKey = pattern.join('→');
        patternCounts.set(patternKey, (patternCounts.get(patternKey) || 0) + 1);
      }
    }

    // Filter by minimum support
    const totalSequences = sequences.length;
    const frequentPatterns: LearningPattern[] = [];

    patternCounts.forEach((count, patternKey) => {
      const support = count / totalSequences;
      if (support >= minSupport) {
        frequentPatterns.push({
          id: crypto.randomUUID(),
          pattern: patternKey.split('→'),
          frequency: count,
          confidence: support,
          lastSeen: new Date(),
          context: 'behavioral_sequence'
        });
      }
    });

    setPatterns(prev => {
      // Merge with existing patterns
      const merged = [...frequentPatterns];
      prev.forEach(existing => {
        const found = frequentPatterns.find(p => 
          JSON.stringify(p.pattern) === JSON.stringify(existing.pattern)
        );
        if (!found) {
          // Decay old patterns
          const decayedFrequency = existing.frequency * 0.9;
          if (decayedFrequency > 1) {
            merged.push({
              ...existing,
              frequency: decayedFrequency
            });
          }
        }
      });
      return merged.slice(0, 50); // Keep top 50 patterns
    });

    console.log(`📊 Mined ${frequentPatterns.length} frequent patterns`);
    return frequentPatterns;
  }, []);

  // Anomaly detection using Isolation Forest approach
  const detectAnomalies = useCallback((): Anomaly[] => {
    if (behaviorData.current.length < 20) return [];

    const recentData = behaviorData.current.slice(-50);
    const detectedAnomalies: Anomaly[] = [];

    // Check for behavioral anomalies
    const actionFrequency = new Map<string, number>();
    recentData.forEach(item => {
      actionFrequency.set(item.action, (actionFrequency.get(item.action) || 0) + 1);
    });

    const avgFrequency = Array.from(actionFrequency.values()).reduce((a, b) => a + b, 0) / actionFrequency.size;

    actionFrequency.forEach((frequency, action) => {
      const deviation = Math.abs(frequency - avgFrequency) / avgFrequency;
      if (deviation > 2) { // More than 2 standard deviations
        detectedAnomalies.push({
          id: crypto.randomUUID(),
          type: 'behavioral',
          description: `Unusual frequency for action "${action}": ${frequency} (avg: ${avgFrequency.toFixed(1)})`,
          severity: Math.min(1, deviation / 3),
          timestamp: new Date(),
          context: { action, frequency, avgFrequency }
        });
      }
    });

    // Check for temporal anomalies
    const timeBetweenActions = [];
    for (let i = 1; i < recentData.length; i++) {
      const timeDiff = recentData[i].timestamp.getTime() - recentData[i-1].timestamp.getTime();
      timeBetweenActions.push(timeDiff);
    }

    const avgTimeBetweenActions = timeBetweenActions.reduce((a, b) => a + b, 0) / timeBetweenActions.length;
    timeBetweenActions.forEach((timeDiff, index) => {
      const deviation = Math.abs(timeDiff - avgTimeBetweenActions) / avgTimeBetweenActions;
      if (deviation > 3) { // Unusual timing
        detectedAnomalies.push({
          id: crypto.randomUUID(),
          type: 'performance',
          description: `Unusual timing between actions: ${timeDiff}ms (avg: ${avgTimeBetweenActions.toFixed(0)}ms)`,
          severity: Math.min(1, deviation / 5),
          timestamp: new Date(),
          context: { timeDiff, avgTimeBetweenActions, index }
        });
      }
    });

    setAnomalies(prev => [...detectedAnomalies, ...prev.slice(0, 20)]); // Keep last 20 anomalies
    return detectedAnomalies;
  }, []);

  // Online learning with gradient descent
  const updatePreferences = useCallback((
    feature: string,
    feedback: number, // -1 to 1
    context: string[] = []
  ) => {
    setPreferences(prev => {
      const existing = prev.find(p => p.feature === feature);
      
      if (existing) {
        // Update existing preference using exponential moving average
        const alpha = metaConfig.learningRate;
        const newPreference = existing.preference * (1 - alpha) + feedback * alpha;
        const newConfidence = Math.min(1, existing.confidence + 0.1);
        
        return prev.map(p => 
          p.feature === feature 
            ? { 
                ...p, 
                preference: newPreference,
                confidence: newConfidence,
                lastUpdated: new Date(),
                context: [...new Set([...p.context, ...context])]
              }
            : p
        );
      } else {
        // Create new preference
        return [...prev, {
          feature,
          preference: feedback,
          confidence: 0.3, // Start with low confidence
          lastUpdated: new Date(),
          context
        }];
      }
    });

    console.log(`🧠 Updated preference for "${feature}": ${feedback.toFixed(2)}`);
  }, [metaConfig.learningRate]);

  // Few-shot adaptation for new domains
  const adaptToNewDomain = useCallback((
    domainName: string,
    examples: Array<{ input: any; output: any }>,
    transferFromDomain?: string
  ) => {
    console.log(`🔄 Adapting to new domain: ${domainName}`);
    
    if (transferFromDomain && examples.length < 5) {
      // Transfer learning from similar domain
      const transferPatterns = patterns.filter(p => p.context === transferFromDomain);
      
      transferPatterns.forEach(pattern => {
        setPatterns(prev => [...prev, {
          ...pattern,
          id: crypto.randomUUID(),
          context: domainName,
          confidence: pattern.confidence * 0.7, // Reduced confidence for transfer
          frequency: 1 // Reset frequency
        }]);
      });
      
      console.log(`📚 Transferred ${transferPatterns.length} patterns from ${transferFromDomain}`);
    }

    // Learn from examples
    examples.forEach((example, index) => {
      updateActionFeedback(
        JSON.stringify(example.input),
        1, // Positive feedback for provided examples
        { domain: domainName, example: index }
      );
    });
  }, [patterns, updateActionFeedback]);

  // Meta-learning: optimize own hyperparameters
  const optimizeMetaParameters = useCallback(() => {
    const recentPerformance = behaviorData.current
      .slice(-50)
      .map(item => item.outcome === 'positive' ? 1 : item.outcome === 'negative' ? -1 : 0);

    const avgPerformance = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;

    // Adjust exploration rate based on performance
    if (avgPerformance > 0.3) {
      // Good performance, reduce exploration
      setMetaConfig(prev => ({
        ...prev,
        explorationRate: Math.max(0.05, prev.explorationRate * 0.95)
      }));
    } else if (avgPerformance < -0.1) {
      // Poor performance, increase exploration
      setMetaConfig(prev => ({
        ...prev,
        explorationRate: Math.min(0.5, prev.explorationRate * 1.05)
      }));
    }

    // Adjust learning rate based on preference stability
    const preferenceChanges = preferences.map(p => {
      const hoursSinceUpdate = (Date.now() - p.lastUpdated.getTime()) / (1000 * 60 * 60);
      return hoursSinceUpdate < 1 ? 1 : 0;
    }).reduce((a, b) => a + b, 0);

    if (preferenceChanges > preferences.length * 0.5) {
      // Many recent changes, increase learning rate
      setMetaConfig(prev => ({
        ...prev,
        learningRate: Math.min(0.3, prev.learningRate * 1.1)
      }));
    } else {
      // Stable preferences, decrease learning rate
      setMetaConfig(prev => ({
        ...prev,
        learningRate: Math.max(0.01, prev.learningRate * 0.98)
      }));
    }

    console.log('🎛️ Meta-parameters optimized:', metaConfig);
  }, [behaviorData.current, preferences, metaConfig]);

  // Curriculum learning: gradually increase complexity
  const getCurriculumRecommendation = useCallback((): {
    complexity: number;
    features: string[];
    reasoning: string;
  } => {
    const userExperience = behaviorData.current.length;
    const recentSuccessRate = behaviorData.current
      .slice(-20)
      .filter(item => item.outcome === 'positive').length / 20;

    let recommendedComplexity = 0.3; // Start simple
    
    if (userExperience > 50 && recentSuccessRate > 0.7) {
      recommendedComplexity = 0.6;
    }
    if (userExperience > 200 && recentSuccessRate > 0.8) {
      recommendedComplexity = 0.9;
    }

    const availableFeatures = [
      'basic_chat', 'document_upload', 'semantic_search',
      'knowledge_graph', 'cognitive_insights', 'multi_agent',
      'neural_networks', 'blackboard_system'
    ];

    const maxFeatures = Math.floor(recommendedComplexity * availableFeatures.length);
    const recommendedFeatures = availableFeatures.slice(0, maxFeatures);

    return {
      complexity: recommendedComplexity,
      features: recommendedFeatures,
      reasoning: `Based on ${userExperience} interactions with ${(recentSuccessRate * 100).toFixed(0)}% success rate`
    };
  }, []);

  // Periodic learning tasks
  useEffect(() => {
    const interval = setInterval(() => {
      mineFrequentPatterns();
      detectAnomalies();
      optimizeMetaParameters();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [mineFrequentPatterns, detectAnomalies, optimizeMetaParameters]);

  return {
    // State
    patterns,
    preferences,
    anomalies,
    metaConfig,
    
    // Multi-Armed Bandit
    selectAction,
    updateActionFeedback,
    banditArms: Object.fromEntries(banditArms.current),
    
    // Pattern Mining
    mineFrequentPatterns,
    
    // Anomaly Detection
    detectAnomalies,
    
    // Preference Learning
    updatePreferences,
    
    // Transfer Learning
    adaptToNewDomain,
    
    // Meta-Learning
    optimizeMetaParameters,
    
    // Curriculum Learning
    getCurriculumRecommendation,
    
    // Analytics
    behaviorData: behaviorData.current.slice(-100),
    learningStats: {
      totalExperience: behaviorData.current.length,
      patternsFound: patterns.length,
      anomaliesDetected: anomalies.length,
      preferencesLearned: preferences.length
    }
  };
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface CognitiveMode {
  type: 'focus' | 'exploration' | 'analysis' | 'creative';
  description: string;
  active: boolean;
  config: {
    distractionLevel: number;
    informationDensity: number;
    interactionComplexity: number;
    visualComplexity: number;
  };
}

export interface UserContext {
  currentTask: string;
  cognitiveLoad: number;
  expertiseLevel: number;
  preferredComplexity: number;
  recentActions: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface AdaptiveElement {
  id: string;
  type: 'shortcut' | 'suggestion' | 'widget' | 'filter';
  priority: number;
  frequency: number;
  lastUsed: Date;
  context: string[];
}

export interface PredictiveAction {
  action: string;
  confidence: number;
  context: string;
  shortcut: string;
}

export function useAdaptiveUI() {
  const { user } = useAuth();
  const [currentMode, setCurrentMode] = useState<CognitiveMode>({
    type: 'focus',
    description: 'Modo Focado - Interface minimalista para concentração máxima',
    active: true,
    config: {
      distractionLevel: 0.1,
      informationDensity: 0.3,
      interactionComplexity: 0.2,
      visualComplexity: 0.2
    }
  });

  const [userContext, setUserContext] = useState<UserContext>({
    currentTask: '',
    cognitiveLoad: 0.5,
    expertiseLevel: 0.7,
    preferredComplexity: 0.6,
    recentActions: [],
    timeOfDay: 'morning',
    deviceType: 'desktop'
  });

  const [adaptiveElements, setAdaptiveElements] = useState<AdaptiveElement[]>([]);
  const [predictiveActions, setPredictiveActions] = useState<PredictiveAction[]>([]);
  const actionHistory = useRef<Array<{ action: string; timestamp: Date; context: string }>>([]);

  // Cognitive modes configuration
  const cognitiveModes: Record<string, CognitiveMode> = {
    focus: {
      type: 'focus',
      description: 'Modo Focado - Interface minimalista para deep work',
      active: false,
      config: {
        distractionLevel: 0.1,
        informationDensity: 0.3,
        interactionComplexity: 0.2,
        visualComplexity: 0.2
      }
    },
    exploration: {
      type: 'exploration',
      description: 'Modo Exploratório - Mostra conexões e sugestões',
      active: false,
      config: {
        distractionLevel: 0.7,
        informationDensity: 0.8,
        interactionComplexity: 0.6,
        visualComplexity: 0.7
      }
    },
    analysis: {
      type: 'analysis',
      description: 'Modo Analítico - Dashboards e métricas detalhadas',
      active: false,
      config: {
        distractionLevel: 0.4,
        informationDensity: 0.9,
        interactionComplexity: 0.8,
        visualComplexity: 0.6
      }
    },
    creative: {
      type: 'creative',
      description: 'Modo Criativo - Canvas livre e brainstorming',
      active: false,
      config: {
        distractionLevel: 0.3,
        informationDensity: 0.5,
        interactionComplexity: 0.4,
        visualComplexity: 0.9
      }
    }
  };

  // Detect time of day
  const detectTimeOfDay = useCallback((): UserContext['timeOfDay'] => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }, []);

  // Detect device type
  const detectDeviceType = useCallback((): UserContext['deviceType'] => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Calculate cognitive load based on current context
  const calculateCognitiveLoad = useCallback((): number => {
    const recentActionCount = actionHistory.current.filter(
      action => Date.now() - action.timestamp.getTime() < 60000 // Last minute
    ).length;

    const taskComplexity = userContext.currentTask.length > 100 ? 0.7 : 0.3;
    const timeStress = userContext.timeOfDay === 'evening' ? 0.6 : 0.4;
    const deviceStress = userContext.deviceType === 'mobile' ? 0.5 : 0.2;
    
    return Math.min(1.0, (recentActionCount * 0.1 + taskComplexity + timeStress + deviceStress) / 3);
  }, [userContext]);

  // Predict next actions using Markov chain
  const predictNextActions = useCallback((): PredictiveAction[] => {
    if (actionHistory.current.length < 5) return [];

    const recentActions = actionHistory.current.slice(-10);
    const actionSequences = new Map<string, Map<string, number>>();

    // Build transition matrix
    for (let i = 0; i < recentActions.length - 1; i++) {
      const current = recentActions[i].action;
      const next = recentActions[i + 1].action;

      if (!actionSequences.has(current)) {
        actionSequences.set(current, new Map());
      }
      
      const transitions = actionSequences.get(current)!;
      transitions.set(next, (transitions.get(next) || 0) + 1);
    }

    // Predict based on last action
    const lastAction = recentActions[recentActions.length - 1]?.action;
    if (!lastAction || !actionSequences.has(lastAction)) return [];

    const transitions = actionSequences.get(lastAction)!;
    const totalTransitions = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);

    const predictions: PredictiveAction[] = Array.from(transitions.entries())
      .map(([action, count]) => ({
        action,
        confidence: count / totalTransitions,
        context: userContext.currentTask,
        shortcut: `Ctrl+${action.charAt(0).toUpperCase()}`
      }))
      .filter(p => p.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return predictions;
  }, [userContext.currentTask]);

  // Optimize interface complexity based on cognitive load
  const optimizeInterfaceComplexity = useCallback(() => {
    const cognitiveLoad = calculateCognitiveLoad();
    
    // High cognitive load = simpler interface
    if (cognitiveLoad > 0.7 && currentMode.type !== 'focus') {
      switchCognitiveMode('focus');
    }
    // Low cognitive load = more information can be shown
    else if (cognitiveLoad < 0.3 && currentMode.type === 'focus') {
      switchCognitiveMode('exploration');
    }
  }, [calculateCognitiveLoad, currentMode.type]);

  // Switch cognitive mode
  const switchCognitiveMode = useCallback((modeType: CognitiveMode['type']) => {
    const newMode = cognitiveModes[modeType];
    if (newMode) {
      setCurrentMode({ ...newMode, active: true });
      
      // Log mode change
      actionHistory.current.push({
        action: `switch_mode_${modeType}`,
        timestamp: new Date(),
        context: userContext.currentTask
      });

      console.log(`🎨 Switched to ${modeType} mode`);
    }
  }, [userContext.currentTask]);

  // Track user action for learning
  const trackAction = useCallback((action: string, context: string = '') => {
    actionHistory.current.push({
      action,
      timestamp: new Date(),
      context: context || userContext.currentTask
    });

    // Keep only last 100 actions
    if (actionHistory.current.length > 100) {
      actionHistory.current = actionHistory.current.slice(-100);
    }

    // Update adaptive elements
    setAdaptiveElements(prev => {
      const existing = prev.find(el => el.id === action);
      if (existing) {
        return prev.map(el => 
          el.id === action 
            ? { ...el, frequency: el.frequency + 1, lastUsed: new Date() }
            : el
        );
      } else {
        return [...prev, {
          id: action,
          type: 'shortcut',
          priority: 1,
          frequency: 1,
          lastUsed: new Date(),
          context: [context || userContext.currentTask]
        }];
      }
    });

    // Update predictions
    setPredictiveActions(predictNextActions());
  }, [userContext.currentTask, predictNextActions]);

  // Get interface config based on current mode
  const getInterfaceConfig = useCallback(() => {
    return {
      showSidebar: currentMode.config.informationDensity > 0.5,
      showTips: currentMode.config.distractionLevel > 0.6,
      animationIntensity: currentMode.config.visualComplexity,
      informationDensity: currentMode.config.informationDensity,
      shortcuts: adaptiveElements
        .filter(el => el.frequency > 2)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
    };
  }, [currentMode, adaptiveElements]);

  // Get adaptive suggestions
  const getAdaptiveSuggestions = useCallback(() => {
    const suggestions = [];
    
    // Time-based suggestions
    switch (userContext.timeOfDay) {
      case 'morning':
        suggestions.push({
          text: 'Começar com tarefas de alta concentração',
          action: 'switch_mode_focus',
          priority: 0.8
        });
        break;
      case 'afternoon':
        suggestions.push({
          text: 'Explorar conexões e insights',
          action: 'switch_mode_exploration',
          priority: 0.7
        });
        break;
      case 'evening':
        suggestions.push({
          text: 'Revisar progresso e fazer análises',
          action: 'switch_mode_analysis',
          priority: 0.6
        });
        break;
    }

    // Cognitive load suggestions
    if (userContext.cognitiveLoad > 0.7) {
      suggestions.push({
        text: 'Diminuir complexidade da interface',
        action: 'reduce_complexity',
        priority: 0.9
      });
    }

    // Expertise-based suggestions
    if (userContext.expertiseLevel > 0.8) {
      suggestions.push({
        text: 'Ativar funcionalidades avançadas',
        action: 'enable_advanced_features',
        priority: 0.7
      });
    }

    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }, [userContext]);

  // Progressive disclosure based on expertise
  const shouldShowFeature = useCallback((
    featureComplexity: number,
    featureName: string
  ): boolean => {
    const baseThreshold = userContext.expertiseLevel;
    const modeMultiplier = currentMode.config.interactionComplexity;
    const threshold = baseThreshold * modeMultiplier;

    // Features used frequently should have lower threshold
    const element = adaptiveElements.find(el => el.id === featureName);
    const frequencyBonus = element ? Math.min(0.3, element.frequency * 0.05) : 0;

    return featureComplexity <= threshold + frequencyBonus;
  }, [userContext.expertiseLevel, currentMode.config.interactionComplexity, adaptiveElements]);

  // Update user context
  const updateUserContext = useCallback((updates: Partial<UserContext>) => {
    setUserContext(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize context detection
  useEffect(() => {
    setUserContext(prev => ({
      ...prev,
      timeOfDay: detectTimeOfDay(),
      deviceType: detectDeviceType(),
      cognitiveLoad: calculateCognitiveLoad()
    }));
  }, [detectTimeOfDay, detectDeviceType, calculateCognitiveLoad]);

  // Periodic optimization
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeInterfaceComplexity();
      setPredictiveActions(predictNextActions());
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [optimizeInterfaceComplexity, predictNextActions]);

  // Context-based mode switching
  useEffect(() => {
    const hour = new Date().getHours();
    
    // Auto-suggest mode changes based on time
    if (hour >= 9 && hour < 12 && currentMode.type !== 'focus') {
      // Morning focus time
      console.log('🌅 Morning focus time suggested');
    } else if (hour >= 14 && hour < 16 && currentMode.type !== 'creative') {
      // Afternoon creativity time
      console.log('🎨 Afternoon creativity time suggested');
    }
  }, [currentMode.type]);

  return {
    // Current state
    currentMode,
    userContext,
    adaptiveElements,
    predictiveActions,
    
    // Mode management
    switchCognitiveMode,
    cognitiveModes,
    
    // Context management
    updateUserContext,
    trackAction,
    
    // Interface optimization
    getInterfaceConfig,
    getAdaptiveSuggestions,
    shouldShowFeature,
    
    // Analytics
    actionHistory: actionHistory.current,
    cognitiveLoad: userContext.cognitiveLoad
  };
}

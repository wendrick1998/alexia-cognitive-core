
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCognitiveSystem } from '@/hooks/useCognitiveSystem';

export interface ProactiveInsight {
  id: string;
  type: 'contradiction' | 'pattern' | 'opportunity' | 'trend' | 'connection';
  title: string;
  description: string;
  confidence: number;
  novelty: number;
  impact: number;
  actionability: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  relatedNodes: string[];
  evidence: any[];
  suggestedActions: string[];
  timestamp: Date;
  shown: boolean;
  dismissed: boolean;
  actedUpon: boolean;
}

export interface InsightGenerationConfig {
  contradictionThreshold: number;
  patternMinSupport: number;
  trendWindowDays: number;
  noveltyDecayRate: number;
  interruptibilityThreshold: number;
}

export interface DeliveryContext {
  userActivity: 'active' | 'idle' | 'away';
  cognitiveLoad: number;
  currentTask: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  interruptibility: number;
}

export function useProactiveInsights() {
  const { user } = useAuth();
  const { cognitiveState, neural } = useCognitiveSystem();
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [config, setConfig] = useState<InsightGenerationConfig>({
    contradictionThreshold: 0.7,
    patternMinSupport: 0.3,
    trendWindowDays: 7,
    noveltyDecayRate: 0.1,
    interruptibilityThreshold: 0.6
  });
  const [deliveryContext, setDeliveryContext] = useState<DeliveryContext>({
    userActivity: 'active',
    cognitiveLoad: 0.5,
    currentTask: '',
    timeOfDay: 'morning',
    interruptibility: 0.7
  });

  const processedData = useRef(new Set<string>());
  const tfIdfCache = useRef(new Map<string, number>());

  // TF-IDF calculation for novelty scoring
  const calculateTfIdf = useCallback((
    term: string,
    document: string,
    corpus: string[]
  ): number => {
    const cacheKey = `${term}_${document.substring(0, 50)}`;
    if (tfIdfCache.current.has(cacheKey)) {
      return tfIdfCache.current.get(cacheKey)!;
    }

    // Term frequency
    const termCount = (document.toLowerCase().match(new RegExp(term.toLowerCase(), 'g')) || []).length;
    const totalWords = document.split(/\s+/).length;
    const tf = termCount / totalWords;

    // Inverse document frequency
    const docsWithTerm = corpus.filter(doc => 
      doc.toLowerCase().includes(term.toLowerCase())
    ).length;
    const idf = Math.log(corpus.length / (docsWithTerm + 1));

    const tfIdf = tf * idf;
    tfIdfCache.current.set(cacheKey, tfIdf);
    
    return tfIdf;
  }, []);

  // Detect contradictions using semantic opposition
  const detectContradictions = useCallback(async (): Promise<ProactiveInsight[]> => {
    const activeNodes = cognitiveState.activeNodes;
    if (activeNodes.length < 2) return [];

    const contradictions: ProactiveInsight[] = [];

    for (let i = 0; i < activeNodes.length; i++) {
      for (let j = i + 1; j < activeNodes.length; j++) {
        const nodeA = activeNodes[i];
        const nodeB = activeNodes[j];

        // Simple semantic opposition detection
        const oppositionKeywords = [
          ['aumentar', 'diminuir'], ['sim', 'não'], ['verdadeiro', 'falso'],
          ['positivo', 'negativo'], ['melhor', 'pior'], ['rápido', 'lento'],
          ['fácil', 'difícil'], ['seguro', 'inseguro']
        ];

        let contradictionScore = 0;
        
        oppositionKeywords.forEach(([word1, word2]) => {
          const hasWord1A = nodeA.content.toLowerCase().includes(word1);
          const hasWord2A = nodeA.content.toLowerCase().includes(word2);
          const hasWord1B = nodeB.content.toLowerCase().includes(word1);
          const hasWord2B = nodeB.content.toLowerCase().includes(word2);

          if ((hasWord1A && hasWord2B) || (hasWord2A && hasWord1B)) {
            contradictionScore += 0.3;
          }
        });

        // Check for temporal contradictions
        const timeKeywords = ['antes', 'depois', 'primeiro', 'último', 'anterior', 'posterior'];
        const hasTimeA = timeKeywords.some(keyword => nodeA.content.toLowerCase().includes(keyword));
        const hasTimeB = timeKeywords.some(keyword => nodeB.content.toLowerCase().includes(keyword));
        
        if (hasTimeA && hasTimeB) {
          contradictionScore += 0.2;
        }

        if (contradictionScore >= config.contradictionThreshold) {
          contradictions.push({
            id: crypto.randomUUID(),
            type: 'contradiction',
            title: 'Contradição Detectada',
            description: `Possível contradição entre: "${nodeA.content.substring(0, 100)}..." e "${nodeB.content.substring(0, 100)}..."`,
            confidence: contradictionScore,
            novelty: 0.8,
            impact: 0.7,
            actionability: 0.9,
            urgency: contradictionScore > 0.8 ? 'high' : 'medium',
            relatedNodes: [nodeA.id, nodeB.id],
            evidence: [
              { type: 'semantic_opposition', score: contradictionScore },
              { type: 'nodes', nodeA: nodeA.content.substring(0, 200), nodeB: nodeB.content.substring(0, 200) }
            ],
            suggestedActions: [
              'Revisar informações conflitantes',
              'Buscar fonte autoritativa',
              'Documentar exceções ou contextos diferentes'
            ],
            timestamp: new Date(),
            shown: false,
            dismissed: false,
            actedUpon: false
          });
        }
      }
    }

    return contradictions;
  }, [cognitiveState.activeNodes, config.contradictionThreshold]);

  // Detect emerging patterns using time series analysis
  const detectEmergingTrends = useCallback((): ProactiveInsight[] => {
    const recentNodes = cognitiveState.activeNodes
      .filter(node => {
        const daysSince = (Date.now() - new Date(node.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= config.trendWindowDays;
      });

    if (recentNodes.length < 5) return [];

    // Group by node type and analyze frequency
    const typeFrequency = new Map<string, number[]>();
    
    recentNodes.forEach(node => {
      const day = Math.floor((Date.now() - new Date(node.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (!typeFrequency.has(node.node_type)) {
        typeFrequency.set(node.node_type, new Array(config.trendWindowDays).fill(0));
      }
      typeFrequency.get(node.node_type)![day]++;
    });

    const trends: ProactiveInsight[] = [];

    typeFrequency.forEach((frequencies, type) => {
      // Simple trend detection using linear regression
      const n = frequencies.length;
      const sumX = frequencies.reduce((acc, _, i) => acc + i, 0);
      const sumY = frequencies.reduce((acc, freq) => acc + freq, 0);
      const sumXY = frequencies.reduce((acc, freq, i) => acc + i * freq, 0);
      const sumXX = frequencies.reduce((acc, _, i) => acc + i * i, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const correlation = slope * Math.sqrt(sumXX / n - (sumX / n) ** 2) / Math.sqrt(sumY / n);

      if (Math.abs(correlation) > 0.6 && Math.abs(slope) > 0.5) {
        const trendDirection = slope > 0 ? 'crescente' : 'decrescente';
        
        trends.push({
          id: crypto.randomUUID(),
          type: 'trend',
          title: `Tendência ${trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)} Detectada`,
          description: `Atividade ${trendDirection} em "${type}" (correlação: ${correlation.toFixed(2)})`,
          confidence: Math.abs(correlation),
          novelty: 0.6,
          impact: Math.abs(slope) / 2,
          actionability: 0.7,
          urgency: Math.abs(slope) > 1 ? 'medium' : 'low',
          relatedNodes: recentNodes.filter(n => n.node_type === type).map(n => n.id),
          evidence: [
            { type: 'time_series', frequencies, slope, correlation },
            { type: 'trend_analysis', direction: trendDirection, strength: Math.abs(slope) }
          ],
          suggestedActions: slope > 0 ? [
            'Investigar causa do aumento',
            'Preparar recursos para demanda crescente',
            'Documentar padrões emergentes'
          ] : [
            'Analisar motivos da redução',
            'Considerar intervenções',
            'Monitorar indicadores relacionados'
          ],
          timestamp: new Date(),
          shown: false,
          dismissed: false,
          actedUpon: false
        });
      }
    });

    return trends;
  }, [cognitiveState.activeNodes, config.trendWindowDays]);

  // Find cross-domain connections
  const findCrossDomainConnections = useCallback((): ProactiveInsight[] => {
    const nodes = cognitiveState.activeNodes;
    if (nodes.length < 3) return [];

    const connections: ProactiveInsight[] = [];

    // Group nodes by domain/project
    const domains = new Map<string, typeof nodes>();
    
    nodes.forEach(node => {
      const domain = node.project_id || 'general';
      if (!domains.has(domain)) {
        domains.set(domain, []);
      }
      domains.get(domain)!.push(node);
    });

    if (domains.size < 2) return [];

    // Find potential connections between domains
    const domainPairs = Array.from(domains.keys());
    
    for (let i = 0; i < domainPairs.length; i++) {
      for (let j = i + 1; j < domainPairs.length; j++) {
        const domainA = domainPairs[i];
        const domainB = domainPairs[j];
        const nodesA = domains.get(domainA)!;
        const nodesB = domains.get(domainB)!;

        // Find common keywords/concepts
        const wordsA = new Set(nodesA.flatMap(n => 
          n.content.toLowerCase().split(/\s+/).filter(w => w.length > 3)
        ));
        const wordsB = new Set(nodesB.flatMap(n => 
          n.content.toLowerCase().split(/\s+/).filter(w => w.length > 3)
        ));

        const commonWords = Array.from(wordsA).filter(word => wordsB.has(word));
        const connectionStrength = commonWords.length / Math.max(wordsA.size, wordsB.size);

        if (connectionStrength > 0.1 && commonWords.length > 2) {
          connections.push({
            id: crypto.randomUUID(),
            type: 'connection',
            title: 'Conexão Cross-Domain Descoberta',
            description: `Conexão encontrada entre domínios "${domainA}" e "${domainB}" através de: ${commonWords.slice(0, 5).join(', ')}`,
            confidence: connectionStrength,
            novelty: 0.8,
            impact: 0.6,
            actionability: 0.8,
            urgency: 'medium',
            relatedNodes: [...nodesA.map(n => n.id), ...nodesB.map(n => n.id)],
            evidence: [
              { type: 'cross_domain_analysis', domains: [domainA, domainB] },
              { type: 'common_concepts', concepts: commonWords, strength: connectionStrength }
            ],
            suggestedActions: [
              'Explorar sinergia entre domínios',
              'Considerar aplicação cruzada de conceitos',
              'Documentar conexões para referência futura'
            ],
            timestamp: new Date(),
            shown: false,
            dismissed: false,
            actedUpon: false
          });
        }
      }
    }

    return connections;
  }, [cognitiveState.activeNodes]);

  // Calculate novelty score using TF-IDF
  const calculateNoveltyScore = useCallback((insight: ProactiveInsight): number => {
    const existingInsights = insights.map(i => i.description);
    const keywords = insight.description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    let noveltyScore = 0;
    keywords.forEach(keyword => {
      const tfIdf = calculateTfIdf(keyword, insight.description, existingInsights);
      noveltyScore += tfIdf;
    });

    return Math.min(1, noveltyScore / keywords.length);
  }, [insights, calculateTfIdf]);

  // Detect user interruptibility
  const detectInterruptibility = useCallback((): number => {
    const currentHour = new Date().getHours();
    const timeScore = currentHour >= 9 && currentHour <= 17 ? 0.8 : 0.4; // Work hours
    
    const cognitiveLoadScore = 1 - deliveryContext.cognitiveLoad;
    const activityScore = deliveryContext.userActivity === 'active' ? 0.7 : 
                         deliveryContext.userActivity === 'idle' ? 0.9 : 0.3;

    return (timeScore + cognitiveLoadScore + activityScore) / 3;
  }, [deliveryContext]);

  // Generate proactive insights
  const generateInsights = useCallback(async (): Promise<ProactiveInsight[]> => {
    console.log('🔮 Generating proactive insights...');

    try {
      const [contradictions, trends, connections] = await Promise.all([
        detectContradictions(),
        Promise.resolve(detectEmergingTrends()),
        Promise.resolve(findCrossDomainConnections())
      ]);

      const allInsights = [...contradictions, ...trends, ...connections];

      // Calculate novelty and rank insights
      const rankedInsights = allInsights.map(insight => ({
        ...insight,
        novelty: calculateNoveltyScore(insight)
      })).sort((a, b) => {
        // Multi-criteria ranking
        const scoreA = a.confidence * 0.3 + a.novelty * 0.3 + a.impact * 0.2 + a.actionability * 0.2;
        const scoreB = b.confidence * 0.3 + b.novelty * 0.3 + b.impact * 0.2 + b.actionability * 0.2;
        return scoreB - scoreA;
      });

      // Add to insights state
      setInsights(prev => {
        const newInsights = rankedInsights.filter(insight => 
          !prev.some(existing => existing.description === insight.description)
        );
        return [...newInsights, ...prev].slice(0, 50); // Keep only top 50
      });

      console.log(`✨ Generated ${rankedInsights.length} new insights`);
      return rankedInsights;

    } catch (error) {
      console.error('❌ Error generating insights:', error);
      return [];
    }
  }, [detectContradictions, detectEmergingTrends, findCrossDomainConnections, calculateNoveltyScore]);

  // Deliver insight based on context
  const deliverInsight = useCallback((insightId: string): boolean => {
    const insight = insights.find(i => i.id === insightId);
    if (!insight || insight.shown) return false;

    const interruptibility = detectInterruptibility();
    
    if (interruptibility < config.interruptibilityThreshold && insight.urgency !== 'critical') {
      console.log(`⏰ Delaying insight delivery (interruptibility: ${interruptibility.toFixed(2)})`);
      return false;
    }

    // Mark as shown
    setInsights(prev => prev.map(i => 
      i.id === insightId ? { ...i, shown: true } : i
    ));

    // Trigger notification (would integrate with Web Push API)
    console.log(`📢 Delivering insight: ${insight.title}`);
    
    // Simulate notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(insight.title, {
        body: insight.description.substring(0, 100) + '...',
        icon: '/favicon.ico',
        tag: insightId
      });
    }

    return true;
  }, [insights, detectInterruptibility, config.interruptibilityThreshold]);

  // Mark insight as acted upon
  const markActedUpon = useCallback((insightId: string, action: string) => {
    setInsights(prev => prev.map(i => 
      i.id === insightId ? { ...i, actedUpon: true } : i
    ));
    
    console.log(`✅ Insight ${insightId} acted upon: ${action}`);
  }, []);

  // Dismiss insight
  const dismissInsight = useCallback((insightId: string) => {
    setInsights(prev => prev.map(i => 
      i.id === insightId ? { ...i, dismissed: true } : i
    ));
  }, []);

  // Update delivery context
  const updateDeliveryContext = useCallback((updates: Partial<DeliveryContext>) => {
    setDeliveryContext(prev => ({ ...prev, ...updates }));
  }, []);

  // Periodic insight generation
  useEffect(() => {
    const interval = setInterval(() => {
      generateInsights();
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [generateInsights]);

  // Auto-delivery of high-priority insights
  useEffect(() => {
    const criticalInsights = insights.filter(i => 
      !i.shown && !i.dismissed && i.urgency === 'critical'
    );

    criticalInsights.forEach(insight => {
      deliverInsight(insight.id);
    });
  }, [insights, deliverInsight]);

  return {
    // State
    insights: insights.filter(i => !i.dismissed),
    config,
    deliveryContext,
    
    // Core functions
    generateInsights,
    deliverInsight,
    markActedUpon,
    dismissInsight,
    
    // Context management
    updateDeliveryContext,
    detectInterruptibility,
    
    // Configuration
    setConfig,
    
    // Analytics
    insightStats: {
      total: insights.length,
      shown: insights.filter(i => i.shown).length,
      actedUpon: insights.filter(i => i.actedUpon).length,
      byType: insights.reduce((acc, i) => {
        acc[i.type] = (acc[i.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }
  };
}


import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface IntentAnalysis {
  surfaceIntent: string;
  deepIntent: string;
  contextualIntent: string;
  implicitIntent: string[];
  entities: {
    named: string[];
    temporal: string[];
    technical: string[];
    references: string[];
  };
  complexityScore: {
    syntactic: number;
    semantic: number;
    execution: number;
    resource: number;
    overall: number;
  };
  confidence: number;
  suggestedActions: string[];
}

export interface EntityPattern {
  type: 'named' | 'temporal' | 'technical' | 'reference';
  pattern: RegExp;
  extractor: (match: RegExpMatchArray) => string;
}

export function useIntentEngine() {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCache, setAnalysisCache] = useState<Map<string, IntentAnalysis>>(new Map());

  // Entity patterns for recognition
  const entityPatterns = useRef<EntityPattern[]>([
    // Named entities
    { type: 'named', pattern: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, extractor: (m) => m[0] },
    
    // Temporal entities
    { type: 'temporal', pattern: /\b(?:hoje|amanhã|ontem|próxima?\s+semana|mês\s+passado|em\s+\d+\s+dias?)\b/gi, extractor: (m) => m[0] },
    { type: 'temporal', pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, extractor: (m) => m[0] },
    
    // Technical entities
    { type: 'technical', pattern: /\b(?:React|TypeScript|JavaScript|Python|SQL|API|database|função|component[e]?)\b/gi, extractor: (m) => m[0] },
    { type: 'technical', pattern: /\b(?:hook|estado|props|interface|classe)\b/gi, extractor: (m) => m[0] },
    
    // References
    { type: 'reference', pattern: /\b(?:projeto|arquivo|documento|conversação?|memória)\s+["']?([^"'\s]+)["']?/gi, extractor: (m) => m[1] || m[0] }
  ]);

  // Surface intent patterns
  const surfaceIntentPatterns = useRef([
    { pattern: /\b(?:crie?|criar|faça|fazer|gere?|gerar|implemente?|implementar)\b/i, intent: 'create' },
    { pattern: /\b(?:modifique?|modificar|altere?|alterar|mude?|mudar|atualize?|atualizar)\b/i, intent: 'modify' },
    { pattern: /\b(?:explique?|explicar|como|o que é|por que|porque)\b/i, intent: 'explain' },
    { pattern: /\b(?:analise?|analisar|verifique?|verificar|revise?|revisar)\b/i, intent: 'analyze' },
    { pattern: /\b(?:delete?|deletar|remova|remover|exclua|excluir)\b/i, intent: 'delete' },
    { pattern: /\b(?:busque?|buscar|encontre?|encontrar|procure?|procurar)\b/i, intent: 'search' },
    { pattern: /\b(?:conecte?|conectar|integre?|integrar|combine?|combinar)\b/i, intent: 'integrate' }
  ]);

  // Complexity scoring functions
  const calculateSyntacticComplexity = useCallback((text: string): number => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length;
    const subordinateClauses = (text.match(/\b(?:que|porque|quando|onde|como|se|caso)\b/gi) || []).length;
    
    return Math.min(1.0, (avgWordsPerSentence / 20 + subordinateClauses / 10) / 2);
  }, []);

  const calculateSemanticComplexity = useCallback((text: string, entities: any): number => {
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const conceptDensity = uniqueWords.size / text.split(/\s+/).length;
    const entityDensity = Object.values(entities).flat().length / text.split(/\s+/).length;
    
    return Math.min(1.0, conceptDensity + entityDensity);
  }, []);

  const calculateExecutionComplexity = useCallback((text: string, surfaceIntent: string): number => {
    const actionWords = (text.match(/\b(?:crie?|implemente?|configure?|instale?|desenvolva?)\b/gi) || []).length;
    const stepIndicators = (text.match(/\b(?:primeiro|segundo|depois|então|finalmente)\b/gi) || []).length;
    
    const complexityMap: Record<string, number> = {
      'create': 0.8,
      'modify': 0.6,
      'integrate': 0.9,
      'explain': 0.3,
      'analyze': 0.5,
      'search': 0.2,
      'delete': 0.4
    };
    
    const baseComplexity = complexityMap[surfaceIntent] || 0.5;
    const multiplier = 1 + (actionWords + stepIndicators) * 0.1;
    
    return Math.min(1.0, baseComplexity * multiplier);
  }, []);

  const calculateResourceComplexity = useCallback((text: string): number => {
    const apiCalls = (text.match(/\bAPI\b/gi) || []).length;
    const databaseOps = (text.match(/\b(?:banco|database|tabela|query|SQL)\b/gi) || []).length;
    const fileOps = (text.match(/\b(?:arquivo|documento|upload|download)\b/gi) || []).length;
    
    return Math.min(1.0, (apiCalls * 0.3 + databaseOps * 0.4 + fileOps * 0.2));
  }, []);

  // Extract entities using patterns
  const extractEntities = useCallback((text: string) => {
    const entities = {
      named: [] as string[],
      temporal: [] as string[],
      technical: [] as string[],
      references: [] as string[]
    };

    entityPatterns.current.forEach(({ type, pattern, extractor }) => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        const entity = extractor(match);
        if (entity && !entities[type].includes(entity)) {
          entities[type].push(entity);
        }
      });
    });

    return entities;
  }, []);

  // Analyze surface intent
  const analyzeSurfaceIntent = useCallback((text: string): string => {
    for (const { pattern, intent } of surfaceIntentPatterns.current) {
      if (pattern.test(text)) {
        return intent;
      }
    }
    return 'general';
  }, []);

  // Deep intent analysis using contextual patterns
  const analyzeDeepIntent = useCallback((text: string, surfaceIntent: string): string => {
    const urgencyIndicators = /\b(?:urgente|rápido|agora|imediatamente|logo)\b/gi.test(text);
    const uncertaintyIndicators = /\b(?:talvez|possivelmente|não tenho certeza|acho que)\b/gi.test(text);
    const learningIndicators = /\b(?:aprenda|ensine|como|tutorial|exemplo)\b/gi.test(text);
    
    if (learningIndicators) return 'learning';
    if (urgencyIndicators) return `urgent_${surfaceIntent}`;
    if (uncertaintyIndicators) return `exploratory_${surfaceIntent}`;
    
    return surfaceIntent;
  }, []);

  // Contextual intent based on conversation history
  const analyzeContextualIntent = useCallback((text: string, conversationHistory: any[]): string => {
    if (!conversationHistory.length) return 'standalone';
    
    const recentMessages = conversationHistory.slice(-3);
    const hasFollowUp = /\b(?:também|além disso|e|mais|continue?|prossiga)\b/gi.test(text);
    const hasReference = /\b(?:isso|aquilo|anterior|último|anterior)\b/gi.test(text);
    
    if (hasFollowUp) return 'continuation';
    if (hasReference) return 'reference_based';
    
    return 'contextual';
  }, []);

  // Detect implicit intents
  const detectImplicitIntents = useCallback((text: string, entities: any): string[] => {
    const implicitIntents: string[] = [];
    
    // Performance concern
    if (/\b(?:lento|demorado|performance|otimização)\b/gi.test(text)) {
      implicitIntents.push('optimize_performance');
    }
    
    // Security concern
    if (/\b(?:segurança|seguro|privacidade|proteger)\b/gi.test(text)) {
      implicitIntents.push('enhance_security');
    }
    
    // Scalability concern
    if (/\b(?:escalar|crescer|muitos usuários|grande volume)\b/gi.test(text)) {
      implicitIntents.push('improve_scalability');
    }
    
    // User experience
    if (/\b(?:usuário|UX|interface|experiência)\b/gi.test(text)) {
      implicitIntents.push('enhance_ux');
    }
    
    // Technical debt
    if (entities.technical.length > 3 || /\b(?:refactor|refatorar|limpar|organizar)\b/gi.test(text)) {
      implicitIntents.push('reduce_technical_debt');
    }
    
    return implicitIntents;
  }, []);

  // Generate suggested actions
  const generateSuggestedActions = useCallback((analysis: Partial<IntentAnalysis>): string[] => {
    const actions: string[] = [];
    
    switch (analysis.surfaceIntent) {
      case 'create':
        actions.push('Planejar arquitetura', 'Definir requisitos', 'Criar protótipo');
        break;
      case 'modify':
        actions.push('Analisar código atual', 'Identificar impactos', 'Implementar mudanças');
        break;
      case 'explain':
        actions.push('Buscar documentação', 'Criar exemplos', 'Explicar conceitos');
        break;
      case 'analyze':
        actions.push('Coletar dados', 'Aplicar métricas', 'Gerar insights');
        break;
      case 'integrate':
        actions.push('Mapear interfaces', 'Testar compatibilidade', 'Implementar conexão');
        break;
    }
    
    // Add actions based on implicit intents
    analysis.implicitIntent?.forEach(intent => {
      switch (intent) {
        case 'optimize_performance':
          actions.push('Analisar gargalos', 'Implementar cache', 'Otimizar queries');
          break;
        case 'enhance_security':
          actions.push('Audit de segurança', 'Implementar autenticação', 'Criptografar dados');
          break;
        case 'improve_scalability':
          actions.push('Desenhar arquitetura distribuída', 'Implementar load balancing');
          break;
      }
    });
    
    return actions.slice(0, 5); // Limit to 5 actions
  }, []);

  // Main analysis function
  const analyzeIntent = useCallback(async (
    text: string, 
    conversationHistory: any[] = []
  ): Promise<IntentAnalysis> => {
    const cacheKey = `${text}_${conversationHistory.length}`;
    
    // Check cache first
    if (analysisCache.has(cacheKey)) {
      return analysisCache.get(cacheKey)!;
    }

    setIsAnalyzing(true);
    
    try {
      // Extract entities
      const entities = extractEntities(text);
      
      // Analyze different intent levels
      const surfaceIntent = analyzeSurfaceIntent(text);
      const deepIntent = analyzeDeepIntent(text, surfaceIntent);
      const contextualIntent = analyzeContextualIntent(text, conversationHistory);
      const implicitIntent = detectImplicitIntents(text, entities);
      
      // Calculate complexity scores
      const syntacticComplexity = calculateSyntacticComplexity(text);
      const semanticComplexity = calculateSemanticComplexity(text, entities);
      const executionComplexity = calculateExecutionComplexity(text, surfaceIntent);
      const resourceComplexity = calculateResourceComplexity(text);
      
      const overallComplexity = (
        syntacticComplexity * 0.2 +
        semanticComplexity * 0.3 +
        executionComplexity * 0.3 +
        resourceComplexity * 0.2
      );
      
      const complexityScore = {
        syntactic: syntacticComplexity,
        semantic: semanticComplexity,
        execution: executionComplexity,
        resource: resourceComplexity,
        overall: overallComplexity
      };
      
      // Calculate confidence based on pattern matches and entity extraction
      const confidence = Math.min(1.0, 
        0.3 + // Base confidence
        (entities.named.length + entities.technical.length) * 0.1 +
        (surfaceIntent !== 'general' ? 0.3 : 0) +
        (implicitIntent.length * 0.1)
      );
      
      const analysis: IntentAnalysis = {
        surfaceIntent,
        deepIntent,
        contextualIntent,
        implicitIntent,
        entities,
        complexityScore,
        confidence,
        suggestedActions: []
      };
      
      // Generate suggested actions
      analysis.suggestedActions = generateSuggestedActions(analysis);
      
      // Cache result
      analysisCache.set(cacheKey, analysis);
      
      console.log('🎯 Intent Analysis Complete:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('❌ Error in intent analysis:', error);
      
      // Fallback analysis
      return {
        surfaceIntent: 'general',
        deepIntent: 'general',
        contextualIntent: 'standalone',
        implicitIntent: [],
        entities: { named: [], temporal: [], technical: [], references: [] },
        complexityScore: {
          syntactic: 0.5,
          semantic: 0.5,
          execution: 0.5,
          resource: 0.5,
          overall: 0.5
        },
        confidence: 0.3,
        suggestedActions: ['Analisar requisitos', 'Buscar informações']
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    analysisCache,
    extractEntities,
    analyzeSurfaceIntent,
    analyzeDeepIntent,
    analyzeContextualIntent,
    detectImplicitIntents,
    calculateSyntacticComplexity,
    calculateSemanticComplexity,
    calculateExecutionComplexity,
    calculateResourceComplexity,
    generateSuggestedActions
  ]);

  // Clear cache periodically
  const clearCache = useCallback(() => {
    setAnalysisCache(new Map());
  }, []);

  return {
    analyzeIntent,
    isAnalyzing,
    clearCache,
    cacheSize: analysisCache.size
  };
}

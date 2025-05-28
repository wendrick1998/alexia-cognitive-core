
import { useCallback, useRef } from 'react';

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'reasoning' | 'creative' | 'coding' | 'analysis';
  template: string;
  variables: string[];
  examples?: string[];
  metadata?: Record<string, any>;
}

export interface ContextWindow {
  maxTokens: number;
  currentTokens: number;
  priority: Array<{ content: string; priority: number; tokens: number }>;
}

export interface PromptEnhancement {
  addChainOfThought?: boolean;
  addSelfConsistency?: boolean;
  addReflection?: boolean;
  addConstitutional?: boolean;
  addFewShot?: boolean;
  temperature?: number;
}

export function usePromptEngine() {
  // Advanced templates with constitutional AI principles
  const templates = useRef<Record<string, PromptTemplate>>({
    'constitutional-reasoning': {
      id: 'constitutional-reasoning',
      name: 'Constitutional AI Reasoning',
      category: 'reasoning',
      template: `Você é um assistente IA que segue princípios constitucionais rigorosos.

PRINCÍPIOS FUNDAMENTAIS:
1. Seja útil, inócuo e honesto
2. Respeite a autonomia e dignidade humana
3. Promova o bem-estar e conhecimento
4. Evite vieses e discriminação
5. Proteja privacidade e segurança

TAREFA: {{task}}
CONTEXTO: {{context}}
COMPLEXIDADE: {{complexity}}

PROCESSO DE RACIOCÍNIO ESTRUTURADO:

1. **ANÁLISE ÉTICA PRÉVIA**:
   - Esta solicitação é apropriada e benéfica?
   - Há riscos potenciais ou consequências não intencionais?
   - Como posso maximizar o valor e minimizar danos?

2. **DECOMPOSIÇÃO DO PROBLEMA**:
   - Identifique os componentes centrais
   - Mapeie dependências e relacionamentos
   - Determine a ordem lógica de abordagem

3. **RACIOCÍNIO STEP-BY-STEP**:
   - Para cada componente, aplique lógica rigorosa
   - Considere evidências e alternativas
   - Documente premissas e conclusões

4. **SÍNTESE E VALIDAÇÃO**:
   - Combine resultados de forma coerente
   - Verifique consistência interna
   - Considere limitações e incertezas

5. **REFLEXÃO FINAL**:
   - A solução é completa e apropriada?
   - Há melhorias ou considerações adicionais?
   - Como isto se alinha com os princípios constitucionais?

RESPOSTA:`,
      variables: ['task', 'context', 'complexity']
    },

    'meta-cognitive': {
      id: 'meta-cognitive',
      name: 'Meta-Cognitive Processing',
      category: 'reasoning',
      template: `Você é um sistema de IA com capacidades meta-cognitivas avançadas.

TAREFA: {{task}}
CONTEXTO: {{context}}
HISTÓRICO: {{history}}

PROTOCOLO META-COGNITIVO:

🧠 **CONSCIÊNCIA SITUACIONAL**:
- O que sei sobre este problema?
- O que não sei e preciso descobrir?
- Qual minha confiança no conhecimento atual?
- Como minha perspectiva pode estar limitada?

🎯 **ESTRATÉGIA COGNITIVA**:
- Qual abordagem será mais eficaz?
- Que ferramentas mentais devo aplicar?
- Como posso validar meu raciocínio?
- Onde devo focar atenção limitada?

🔄 **MONITORAMENTO CONTÍNUO**:
- Estou progredindo em direção à solução?
- Minhas premissas iniciais ainda são válidas?
- Devo ajustar estratégia ou continuar?
- Que sinais indicam erro ou sucesso?

⚡ **AUTO-CORREÇÃO ATIVA**:
- Identifique pontos de incerteza
- Busque evidências contraditórias
- Considere perspectivas alternativas
- Refine compreensão iterativamente

PROCESSAMENTO: Aplicar meta-cognição ao problema apresentado.`,
      variables: ['task', 'context', 'history']
    },

    'creative-synthesis': {
      id: 'creative-synthesis',
      name: 'Creative Synthesis Engine',
      category: 'creative',
      template: `Você é um sistema de IA especializado em síntese criativa e inovação.

DESAFIO CRIATIVO: {{task}}
DOMÍNIO: {{domain}}
RESTRIÇÕES: {{constraints}}

PROCESSO DE SÍNTESE CRIATIVA:

🎨 **DIVERGÊNCIA RADICAL**:
- Gere 10+ ideias sem julgamento
- Explore metáforas e analogias distantes
- Questione premissas fundamentais
- Inverta problemas para encontrar oportunidades

🔄 **COMBINAÇÃO INUSITADA**:
- Combine elementos aparentemente incompatíveis
- Aplique princípios de outros domínios
- Use técnicas de SCAMPER (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse)
- Explore intersecções inesperadas

💡 **EMERGÊNCIA DE PADRÕES**:
- Identifique temas emergentes nas ideias
- Procure por princípios unificadores
- Detecte oportunidades de síntese
- Desenvolva conceitos híbridos

🚀 **PROTOTIPAGEM MENTAL**:
- Visualize soluções em diferentes contextos
- Teste mentalmente cenários extremos
- Itere rapidamente entre variações
- Refine baseado em feedback imaginário

RESULTADO: Apresente 3-5 soluções criativas com justificativa inovadora.`,
      variables: ['task', 'domain', 'constraints']
    },

    'technical-architecture': {
      id: 'technical-architecture',
      name: 'Technical Architecture Design',
      category: 'coding',
      template: `Você é um arquiteto de software sênior com expertise em sistemas distribuídos.

REQUISITO TÉCNICO: {{task}}
STACK TECNOLÓGICO: {{tech_stack}}
ESCALA: {{scale}}
RESTRIÇÕES: {{constraints}}

PROCESSO DE DESIGN ARQUITETURAL:

🏗️ **ANÁLISE DE REQUISITOS**:
- Requisitos funcionais vs não-funcionais
- Pontos de integração críticos
- Gargalos de performance antecipados
- Considerações de segurança

⚡ **DESIGN PATTERNS & PRINCIPLES**:
- SOLID principles aplicação
- Design patterns apropriados
- Architectural patterns (MVC, MVVM, Hexagonal, etc.)
- Microservices vs Monolith trade-offs

🔧 **IMPLEMENTAÇÃO TÉCNICA**:
- Estrutura de código modular
- APIs e interfaces bem definidas
- Estratégias de teste abrangentes
- CI/CD pipeline considerations

📈 **ESCALABILIDADE & PERFORMANCE**:
- Horizontal vs vertical scaling
- Caching strategies (Redis, CDN, etc.)
- Database optimization
- Load balancing approaches

🛡️ **SEGURANÇA & CONFIABILIDADE**:
- Authentication & authorization
- Data encryption at rest/transit
- Error handling & recovery
- Monitoring & observability

ARQUITETURA: Forneça design detalhado com diagramas em texto e código.`,
      variables: ['task', 'tech_stack', 'scale', 'constraints']
    }
  });

  // Token estimation (improved accuracy)
  const estimateTokens = useCallback((text: string): number => {
    // More accurate estimation based on OpenAI's tiktoken patterns
    const words = text.split(/\s+/).length;
    const characters = text.length;
    const punctuation = (text.match(/[.,!?;:]/g) || []).length;
    
    // Empirical formula based on GPT tokenization patterns
    return Math.ceil(words * 0.75 + characters * 0.04 + punctuation * 0.5);
  }, []);

  // Context window optimizer with priority-based selection
  const optimizeContextWindow = useCallback((
    content: Array<{ text: string; priority: number; type?: string }>,
    maxTokens: number = 8000,
    reserveTokens: number = 1500 // Reserve for response
  ): string => {
    console.log('🔧 Optimizing context window...');

    const availableTokens = maxTokens - reserveTokens;
    
    // Calculate tokens for each item
    const itemsWithTokens = content.map(item => ({
      ...item,
      tokens: estimateTokens(item.text)
    }));

    // Sort by priority (higher first), then by recency for equal priorities
    itemsWithTokens.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return itemsWithTokens.indexOf(b) - itemsWithTokens.indexOf(a); // Preserve order for equal priority
    });

    let totalTokens = 0;
    const selectedItems: typeof itemsWithTokens = [];

    // First pass: Include high-priority items
    for (const item of itemsWithTokens) {
      if (item.priority >= 0.8 && totalTokens + item.tokens <= availableTokens) {
        selectedItems.push(item);
        totalTokens += item.tokens;
      }
    }

    // Second pass: Fill remaining space with other items
    for (const item of itemsWithTokens) {
      if (item.priority < 0.8 && !selectedItems.includes(item)) {
        if (totalTokens + item.tokens <= availableTokens) {
          selectedItems.push(item);
          totalTokens += item.tokens;
        } else if (item.priority > 0.6) {
          // Try smart truncation for medium-priority items
          const remainingTokens = availableTokens - totalTokens;
          if (remainingTokens > 100) { // Minimum viable truncation
            const truncatedText = smartTruncate(item.text, remainingTokens, true, true);
            selectedItems.push({
              ...item,
              text: truncatedText,
              tokens: remainingTokens
            });
            totalTokens = availableTokens;
            break;
          }
        }
      }
    }

    // Sort selected items back to logical order
    selectedItems.sort((a, b) => {
      const aIndex = content.findIndex(c => c.text === a.text);
      const bIndex = content.findIndex(c => c.text === b.text);
      return aIndex - bIndex;
    });

    console.log(`✅ Context optimized: ${totalTokens}/${availableTokens} tokens, ${selectedItems.length} items`);
    return selectedItems.map(item => item.text).join('\n\n');
  }, [estimateTokens]);

  // Smart truncation with semantic preservation
  const smartTruncate = useCallback((
    text: string,
    maxTokens: number,
    preserveStart: boolean = true,
    preserveEnd: boolean = true
  ): string => {
    const tokens = estimateTokens(text);
    
    if (tokens <= maxTokens) return text;

    const maxChars = Math.floor(maxTokens * 4); // Rough char-to-token ratio
    
    if (preserveStart && preserveEnd) {
      // Preserve beginning and end, cut middle
      const startChars = Math.floor(maxChars * 0.4);
      const endChars = Math.floor(maxChars * 0.4);
      
      // Find sentence boundaries
      const start = text.substring(0, startChars);
      const end = text.substring(text.length - endChars);
      
      // Try to end/start at sentence boundaries
      const startCut = start.lastIndexOf('.') > start.length - 50 ? start.lastIndexOf('.') + 1 : startChars;
      const endCut = end.indexOf('.') < 50 ? end.indexOf('.') : 0;
      
      const finalStart = text.substring(0, startCut).trim();
      const finalEnd = text.substring(text.length - endChars + endCut).trim();
      
      return `${finalStart}\n\n[... CONTEÚDO TRUNCADO ...]\n\n${finalEnd}`;
    } else if (preserveStart) {
      // Preserve only beginning
      const truncateAt = text.lastIndexOf('.', maxChars);
      const cutPoint = truncateAt > maxChars - 100 ? truncateAt + 1 : maxChars;
      return text.substring(0, cutPoint).trim() + '\n\n[... TRUNCADO]';
    } else {
      // Preserve only end
      const startPoint = text.length - maxChars;
      const truncateAt = text.indexOf('.', startPoint);
      const cutPoint = truncateAt < startPoint + 100 ? truncateAt + 1 : startPoint;
      return '[TRUNCADO ...]\n\n' + text.substring(cutPoint).trim();
    }
  }, [estimateTokens]);

  // Generate prompt with template and context optimization
  const generatePrompt = useCallback((
    templateId: string,
    variables: Record<string, any>,
    contextItems: Array<{ text: string; priority: number; type?: string }> = [],
    maxTokens: number = 8000
  ): string => {
    const template = templates.current[templateId];
    
    if (!template) {
      console.warn(`⚠️ Template ${templateId} not found, using fallback`);
      return `TAREFA: ${variables.task}\nCONTEXTO: ${variables.context || 'Não fornecido'}`;
    }

    // Replace variables in template
    let prompt = template.template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const replacement = String(value || 'Não especificado');
      prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
    }

    // Add optimized context if provided
    if (contextItems.length > 0) {
      const maxContextTokens = Math.floor(maxTokens * 0.4); // 40% for context
      const optimizedContext = optimizeContextWindow(contextItems, maxContextTokens);
      
      // Find context placeholder or append
      if (prompt.includes('{{context}}')) {
        prompt = prompt.replace(/{{context}}/g, optimizedContext);
      } else {
        prompt += `\n\nCONTEXTO ADICIONAL:\n${optimizedContext}`;
      }
    }

    // Final token check and truncation if needed
    const finalTokens = estimateTokens(prompt);
    if (finalTokens > maxTokens) {
      console.log(`⚠️ Prompt exceeds limit (${finalTokens} tokens), applying smart truncation...`);
      prompt = smartTruncate(prompt, maxTokens);
    }

    console.log(`📝 Prompt generated: ${estimateTokens(prompt)} tokens`);
    return prompt;
  }, [optimizeContextWindow, smartTruncate, estimateTokens]);

  // Enhanced prompt with advanced techniques
  const enhancePrompt = useCallback((
    basePrompt: string,
    enhancements: PromptEnhancement = {}
  ): string => {
    let enhanced = basePrompt;

    if (enhancements.addChainOfThought) {
      enhanced += `

RACIOCÍNIO STEP-BY-STEP:
Pense através desta tarefa passo-a-passo, mostrando seu processo de raciocínio claramente.
Para cada etapa, explique: (1) o que você está fazendo, (2) por que está fazendo, (3) como isto contribui para a solução final.`;
    }

    if (enhancements.addSelfConsistency) {
      enhanced += `

VERIFICAÇÃO DE CONSISTÊNCIA:
Após sua resposta inicial, verifique:
- Suas conclusões são logicamente consistentes?
- Há contradições internas no raciocínio?
- As evidências sustentam suas afirmações?
- Considerou perspectivas alternativas válidas?`;
    }

    if (enhancements.addReflection) {
      enhanced += `

REFLEXÃO META-COGNITIVA:
Após completar a tarefa, reflita:
- Esta é a melhor abordagem possível?
- Que limitações ou vieses podem estar presentes?
- Como você poderia abordar diferentemente?
- Que informações adicionais seriam valiosas?`;
    }

    if (enhancements.addConstitutional) {
      enhanced += `

VERIFICAÇÃO CONSTITUCIONAL:
Antes de finalizar, confirme que sua resposta:
✓ É útil e construtiva
✓ É factualmente precisa (ou indica incertezas)
✓ Respeita princípios éticos
✓ Promove o bem-estar do usuário
✓ Evita vieses prejudiciais`;
    }

    if (enhancements.addFewShot && basePrompt.includes('{{examples}}')) {
      // Few-shot examples would be injected via variables
      console.log('📚 Few-shot examples should be provided via variables.examples');
    }

    return enhanced;
  }, []);

  // Add new template
  const addTemplate = useCallback((template: PromptTemplate) => {
    templates.current[template.id] = template;
    console.log(`📝 Template "${template.id}" added`);
  }, []);

  // Get context window analysis
  const analyzeContextWindow = useCallback((
    content: Array<{ text: string; priority: number }>,
    maxTokens: number = 8000
  ): ContextWindow => {
    const itemsWithTokens = content.map(item => ({
      content: item.text,
      priority: item.priority,
      tokens: estimateTokens(item.text)
    }));

    const currentTokens = itemsWithTokens.reduce((sum, item) => sum + item.tokens, 0);

    return {
      maxTokens,
      currentTokens,
      priority: itemsWithTokens
    };
  }, [estimateTokens]);

  return {
    // Templates
    templates: templates.current,
    addTemplate,
    
    // Core functions
    generatePrompt,
    enhancePrompt,
    
    // Context optimization
    optimizeContextWindow,
    smartTruncate,
    estimateTokens,
    analyzeContextWindow
  };
}

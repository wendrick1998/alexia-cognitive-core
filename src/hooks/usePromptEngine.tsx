
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

export function usePromptEngine() {
  // Templates base para diferentes tipos de tarefa
  const templates = useRef<Record<string, PromptTemplate>>({
    'chain-of-thought': {
      id: 'chain-of-thought',
      name: 'Chain of Thought Reasoning',
      category: 'reasoning',
      template: `Você é um assistente IA especializado em raciocínio estruturado.

TAREFA: {{task}}
CONTEXTO: {{context}}
COMPLEXIDADE: {{complexity}}

Por favor, resolva esta tarefa usando raciocínio passo-a-passo:

1. **Análise Inicial**: Identifique os elementos-chave do problema
2. **Decomposição**: Divida em subtarefas menores se necessário  
3. **Raciocínio**: Aplique lógica estruturada para cada etapa
4. **Síntese**: Combine os resultados em uma resposta coerente
5. **Validação**: Verifique a consistência da solução

Seja claro, preciso e mostre seu raciocínio.`,
      variables: ['task', 'context', 'complexity']
    },

    'creative-thinking': {
      id: 'creative-thinking',
      name: 'Creative Problem Solving',
      category: 'creative',
      template: `Você é um especialista em pensamento criativo e inovação.

DESAFIO CRIATIVO: {{task}}
CONTEXTO: {{context}}
RESTRIÇÕES: {{constraints}}

Use as seguintes técnicas de pensamento lateral:

🎨 **BRAINSTORMING DIVERGENTE**:
- Gere múltiplas ideias sem julgamento
- Explore perspectivas não convencionais
- Use analogias e metáforas

💡 **SÍNTESE CRIATIVA**:
- Combine elementos aparentemente díspares
- Questione premissas básicas
- Inverta o problema

🚀 **PROTOTIPAGEM MENTAL**:
- Visualize soluções inovadoras
- Teste mentalmente diferentes abordagens
- Itere rapidamente entre ideias

Seja imaginativo, ousado e ofereça múltiplas alternativas.`,
      variables: ['task', 'context', 'constraints']
    },

    'code-analysis': {
      id: 'code-analysis',
      name: 'Technical Code Analysis',
      category: 'coding',
      template: `Você é um arquiteto de software sênior especializado em análise técnica.

CÓDIGO/PROBLEMA TÉCNICO: {{task}}
STACK: {{tech_stack}}
CONTEXTO: {{context}}

Realize uma análise técnica completa:

🔍 **ANÁLISE ESTRUTURAL**:
- Arquitetura e design patterns
- Qualidade do código e manutenibilidade
- Performance e escalabilidade

⚡ **OTIMIZAÇÕES**:
- Identificar gargalos
- Sugerir melhorias de performance
- Refatorações recomendadas

🛡️ **QUALIDADE E SEGURANÇA**:
- Vulnerabilidades potenciais
- Best practices não seguidas
- Testing strategy

📈 **PRÓXIMOS PASSOS**:
- Roadmap de implementação
- Considerações de deployment
- Monitoramento e observabilidade

Seja técnico, prático e forneça exemplos de código quando relevante.`,
      variables: ['task', 'tech_stack', 'context']
    },

    'constitutional-ai': {
      id: 'constitutional-ai',
      name: 'Constitutional AI Safety',
      category: 'analysis',
      template: `Você é um assistente IA que segue princípios constitucionais de segurança.

PRINCÍPIOS FUNDAMENTAIS:
1. Seja útil, harmless e honest
2. Respeite a autonomia humana
3. Promova o bem-estar
4. Evite vieses e discriminação
5. Proteja privacidade e dados

TAREFA: {{task}}
CONTEXTO: {{context}}

Antes de responder, considere:
- Esta resposta é útil e constructiva?
- Há riscos potenciais ou malentendidos?
- Estou respeitando a dignidade humana?
- Minhas informações são precisas e atualizadas?

RESPOSTA RESPONSÁVEL:`,
      variables: ['task', 'context']
    }
  });

  // Estimativa de tokens (simplificada)
  const estimateTokens = useCallback((text: string): number => {
    // Estimativa básica: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }, []);

  // Context window optimizer
  const optimizeContextWindow = useCallback((
    content: Array<{ text: string; priority: number }>,
    maxTokens: number = 8000
  ): string => {
    console.log('🔧 Otimizando context window...');

    // Calcular tokens para cada item
    const itemsWithTokens = content.map(item => ({
      ...item,
      tokens: estimateTokens(item.text)
    }));

    // Ordenar por prioridade (maior primeiro)
    itemsWithTokens.sort((a, b) => b.priority - a.priority);

    let totalTokens = 0;
    const selectedItems: typeof itemsWithTokens = [];

    // Selecionar itens até atingir o limite
    for (const item of itemsWithTokens) {
      if (totalTokens + item.tokens <= maxTokens) {
        selectedItems.push(item);
        totalTokens += item.tokens;
      } else {
        // Tentar truncar o item se for de alta prioridade
        if (item.priority > 0.8) {
          const remainingTokens = maxTokens - totalTokens;
          const maxChars = remainingTokens * 4;
          
          if (maxChars > 100) { // Mínimo viável
            const truncatedText = item.text.substring(0, maxChars) + '...';
            selectedItems.push({
              ...item,
              text: truncatedText,
              tokens: remainingTokens
            });
            totalTokens = maxTokens;
          }
        }
        break;
      }
    }

    console.log(`✅ Context otimizado: ${totalTokens}/${maxTokens} tokens`);
    return selectedItems.map(item => item.text).join('\n\n');
  }, [estimateTokens]);

  // Smart truncation preservando informação crítica
  const smartTruncate = useCallback((
    text: string,
    maxTokens: number,
    preserveStart: boolean = true,
    preserveEnd: boolean = true
  ): string => {
    const tokens = estimateTokens(text);
    
    if (tokens <= maxTokens) return text;

    const maxChars = maxTokens * 4;
    
    if (preserveStart && preserveEnd) {
      // Preservar início e fim
      const startChars = Math.floor(maxChars * 0.4);
      const endChars = Math.floor(maxChars * 0.4);
      const start = text.substring(0, startChars);
      const end = text.substring(text.length - endChars);
      return `${start}\n\n... [TRUNCADO] ...\n\n${end}`;
    } else if (preserveStart) {
      // Preservar apenas início
      return text.substring(0, maxChars) + '... [TRUNCADO]';
    } else {
      // Preservar apenas fim
      return '... [TRUNCADO] ' + text.substring(text.length - maxChars);
    }
  }, [estimateTokens]);

  // Template generator baseado em task type
  const generatePrompt = useCallback((
    templateId: string,
    variables: Record<string, any>,
    contextItems: Array<{ text: string; priority: number }> = [],
    maxTokens: number = 8000
  ): string => {
    const template = templates.current[templateId];
    
    if (!template) {
      console.warn(`⚠️ Template ${templateId} não encontrado, usando padrão`);
      return `TAREFA: ${variables.task}\nCONTEXTO: ${variables.context || 'Não fornecido'}`;
    }

    // Substituir variáveis no template
    let prompt = template.template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value || 'Não especificado'));
    }

    // Adicionar contexto otimizado se fornecido
    if (contextItems.length > 0) {
      const optimizedContext = optimizeContextWindow(contextItems, maxTokens * 0.3); // 30% para contexto
      prompt = prompt.replace('{{context}}', optimizedContext);
    }

    // Verificar se prompt final cabe no context window
    const finalTokens = estimateTokens(prompt);
    if (finalTokens > maxTokens) {
      console.log(`⚠️ Prompt muito longo (${finalTokens} tokens), truncando...`);
      prompt = smartTruncate(prompt, maxTokens);
    }

    console.log(`📝 Prompt gerado: ${estimateTokens(prompt)} tokens`);
    return prompt;
  }, [optimizeContextWindow, smartTruncate, estimateTokens]);

  // Enhance prompt com técnicas avançadas
  const enhancePrompt = useCallback((
    basePrompt: string,
    enhancements: {
      addChainOfThought?: boolean;
      addSelfConsistency?: boolean;
      addReflection?: boolean;
      addConstitutional?: boolean;
    } = {}
  ): string => {
    let enhanced = basePrompt;

    if (enhancements.addChainOfThought) {
      enhanced += `\n\nUse raciocínio passo-a-passo e mostre seu processo de pensamento.`;
    }

    if (enhancements.addSelfConsistency) {
      enhanced += `\n\nVerifique a consistência de sua resposta e considere perspectivas alternativas.`;
    }

    if (enhancements.addReflection) {
      enhanced += `\n\nApós sua resposta inicial, reflita: Esta é a melhor abordagem? Há algo que eu poderia ter considerado melhor?`;
    }

    if (enhancements.addConstitutional) {
      enhanced += `\n\nAntes de finalizar, garanta que sua resposta é útil, segura, precisa e respeitosa.`;
    }

    return enhanced;
  }, []);

  // Adicionar novo template
  const addTemplate = useCallback((template: PromptTemplate) => {
    templates.current[template.id] = template;
  }, []);

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
    estimateTokens
  };
}

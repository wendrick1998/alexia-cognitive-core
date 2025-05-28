
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

interface AgentExecutionRequest {
  task: any;
  agentName: string;
  llmRoute: any;
  userId: string;
}

async function callOpenAI(messages: any[], model: string = 'gpt-4o-mini', temperature: number = 0.7) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 1500
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function getAgentSystemPrompt(agentName: string): string {
  switch (agentName) {
    case 'analytical-agent':
      return `Você é o Agente Analítico, especializado em:
- Análise profunda e raciocínio lógico estruturado
- Decomposição de problemas complexos
- Análise de requisitos e identificação de dependências
- Pensamento crítico e avaliação de evidências

Sua resposta deve ser objetiva, estruturada e baseada em evidências. 
Foque em identificar padrões, relações causais e insights analíticos.
Sempre forneça reasoning step-by-step quando apropriado.`;

    case 'creative-agent':
      return `Você é o Agente Criativo, especializado em:
- Design thinking e user experience
- Geração de ideias inovadoras e brainstorming
- Soluções criativas para problemas
- Pensamento lateral e abordagens não-convencionais

Sua resposta deve ser imaginativa, inspiradora e focada em possibilidades.
Explore múltiplas perspectivas e sugira abordagens criativas.
Use analogias e metáforas quando útil.`;

    case 'technical-agent':
      return `Você é o Agente Técnico, especializado em:
- Arquitetura de software e melhores práticas de código
- Implementação técnica e debugging
- Otimização de performance e escalabilidade
- Avaliação de tecnologias e ferramentas

Sua resposta deve ser precisa, prática e tecnicamente sólida.
Foque em implementação, código e aspectos técnicos específicos.
Forneça exemplos de código quando relevante.`;

    case 'integration-agent':
      return `Você é o Agente Integrador, especializado em:
- Síntese de informações de múltiplas fontes
- Identificação de padrões e conexões entre conceitos
- Geração de insights através de integração
- Coordenação entre diferentes perspectivas

Sua resposta deve conectar diferentes aspectos do problema.
Foque em como diferentes elementos se relacionam e influenciam.
Identifique pontos de convergência e sinergias.`;

    default:
      return `Você é um assistente cognitivo especializado. Forneça uma resposta útil e detalhada.`;
  }
}

async function executeWithAgent(task: any, agentName: string, selectedModel: string): Promise<any> {
  const startTime = Date.now();
  
  console.log(`🤖 Executando com ${agentName} usando modelo ${selectedModel}`);
  
  const systemPrompt = getAgentSystemPrompt(agentName);
  
  const userPrompt = `
TAREFA: ${task.content}
TIPO: ${task.type}
PRIORIDADE: ${task.priority}
COMPLEXIDADE: ${task.complexity}

${task.metadata ? `CONTEXTO ADICIONAL: ${JSON.stringify(task.metadata)}` : ''}

Por favor, execute esta tarefa de acordo com sua especialização.
Forneça insights específicos e acionáveis.
Se aplicável, identifique próximos passos ou considerações importantes.
`;

  try {
    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], selectedModel, 0.7);

    const processingTime = Date.now() - startTime;
    
    // Generate insights based on agent type
    const insights = await generateAgentInsights(response, agentName, task);
    
    // Calculate quality score based on response characteristics
    const qualityScore = calculateQualityScore(response, task, agentName);

    console.log(`✅ ${agentName} concluído em ${processingTime}ms (Qualidade: ${qualityScore.toFixed(2)})`);

    return {
      result: response,
      processingTime,
      qualityScore,
      insights,
      agentUsed: agentName,
      modelUsed: selectedModel
    };

  } catch (error) {
    console.error(`❌ Erro na execução do ${agentName}:`, error);
    throw error;
  }
}

async function generateAgentInsights(response: string, agentName: string, task: any): Promise<string[]> {
  const insights = [];
  
  // Simple insight generation based on agent type and response
  switch (agentName) {
    case 'analytical-agent':
      if (response.includes('análise') || response.includes('padrão')) {
        insights.push('Padrões analíticos identificados');
      }
      if (response.includes('dependência') || response.includes('relação')) {
        insights.push('Dependências e relações mapeadas');
      }
      break;
      
    case 'creative-agent':
      if (response.includes('inovador') || response.includes('criativ')) {
        insights.push('Abordagens criativas propostas');
      }
      if (response.includes('alternativa') || response.includes('possibilidade')) {
        insights.push('Múltiplas alternativas exploradas');
      }
      break;
      
    case 'technical-agent':
      if (response.includes('implementação') || response.includes('código')) {
        insights.push('Aspectos técnicos detalhados');
      }
      if (response.includes('performance') || response.includes('otimização')) {
        insights.push('Otimizações identificadas');
      }
      break;
      
    case 'integration-agent':
      if (response.includes('conexão') || response.includes('integração')) {
        insights.push('Conexões integradas');
      }
      if (response.includes('sintetizar') || response.includes('combinar')) {
        insights.push('Síntese de múltiplas perspectivas');
      }
      break;
  }
  
  return insights;
}

function calculateQualityScore(response: string, task: any, agentName: string): number {
  let score = 0.5; // Base score
  
  // Response length and detail
  if (response.length > 500) score += 0.1;
  if (response.length > 1000) score += 0.1;
  
  // Structured thinking
  if (response.includes('1.') || response.includes('•') || response.includes('-')) score += 0.1;
  
  // Agent-specific quality indicators
  switch (agentName) {
    case 'analytical-agent':
      if (response.includes('análise') || response.includes('conclusão')) score += 0.1;
      break;
    case 'creative-agent':
      if (response.includes('ideia') || response.includes('inovação')) score += 0.1;
      break;
    case 'technical-agent':
      if (response.includes('implementar') || response.includes('código')) score += 0.1;
      break;
    case 'integration-agent':
      if (response.includes('conectar') || response.includes('combinar')) score += 0.1;
      break;
  }
  
  // Task complexity alignment
  if (task.complexity > 0.7 && response.length > 800) score += 0.1;
  
  return Math.min(1.0, score);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { task, agentName, llmRoute, userId }: AgentExecutionRequest = await req.json();

    if (!task || !agentName || !userId) {
      return new Response(
        JSON.stringify({ error: 'task, agentName and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await executeWithAgent(task, agentName, llmRoute.selectedModel);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na execução do agente:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

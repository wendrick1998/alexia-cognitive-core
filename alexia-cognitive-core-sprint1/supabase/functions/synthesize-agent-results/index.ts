
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

interface SynthesisRequest {
  results: any[];
  intention: any;
  userId: string;
}

async function callOpenAI(messages: any[], temperature: number = 0.7) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function synthesizeAgentResults(results: any[], intention: any) {
  console.log(`🔄 Sintetizando resultados de ${results.length} agentes...`);
  
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    throw new Error('Nenhum resultado válido para sintetizar');
  }

  const synthesisPrompt = `
Você é um Sintetizador Cognitivo Avançado. Sua função é integrar e sintetizar os resultados de múltiplos agentes especializados em uma resposta coerente e abrangente.

INTENÇÃO ORIGINAL DO USUÁRIO:
${JSON.stringify(intention, null, 2)}

RESULTADOS DOS AGENTES:
${successfulResults.map((result, index) => `
AGENTE ${index + 1} (${result.agentUsed}):
Modelo: ${result.modelUsed}
Qualidade: ${result.qualityScore.toFixed(2)}
Tempo: ${result.processingTime}ms
Insights: ${result.insights.join(', ')}

RESPOSTA:
${result.result}

---
`).join('\n')}

INSTRUÇÕES PARA SÍNTESE:
1. Identifique os pontos principais de cada agente
2. Encontre convergências e complementaridades
3. Resolva eventuais contradições ou tensões
4. Crie uma narrativa coerente que integre as perspectivas
5. Destaque insights únicos que emergem da combinação
6. Mantenha o foco na intenção original do usuário
7. Forneça próximos passos acionáveis quando apropriado

A resposta deve ser estruturada, clara e mais valiosa que a soma das partes individuais.
`;

  const synthesis = await callOpenAI([
    { role: 'system', content: synthesisPrompt },
    { role: 'user', content: 'Por favor, sintetize os resultados dos agentes.' }
  ], 0.6);

  // Extract insights from all successful results
  const allInsights = successfulResults.flatMap(r => r.insights || []);
  const uniqueInsights = [...new Set(allInsights)];

  // Calculate overall quality score
  const avgQuality = successfulResults.reduce((acc, r) => acc + r.qualityScore, 0) / successfulResults.length;
  const synthesisBonus = successfulResults.length > 1 ? 0.1 : 0; // Bonus for multi-agent synthesis
  const overallQuality = Math.min(1.0, avgQuality + synthesisBonus);

  return {
    message: synthesis,
    insights: uniqueInsights,
    agentsUsed: successfulResults.map(r => r.agentUsed),
    qualityScore: overallQuality,
    processingStats: {
      totalAgents: results.length,
      successfulAgents: successfulResults.length,
      avgProcessingTime: successfulResults.reduce((acc, r) => acc + r.processingTime, 0) / successfulResults.length,
      modelsUsed: [...new Set(successfulResults.map(r => r.modelUsed))]
    }
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { results, intention, userId }: SynthesisRequest = await req.json();

    if (!results || !Array.isArray(results) || !userId) {
      return new Response(
        JSON.stringify({ error: 'results array and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const synthesis = await synthesizeAgentResults(results, intention);

    console.log(`✅ Síntese completa com qualidade ${synthesis.qualityScore.toFixed(2)}`);

    return new Response(
      JSON.stringify({ success: true, ...synthesis }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na síntese de resultados:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

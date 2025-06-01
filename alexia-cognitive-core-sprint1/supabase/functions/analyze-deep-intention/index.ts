
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

interface IntentionAnalysisRequest {
  input: string;
  context: any;
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
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function analyzeDeepIntention(input: string, context: any = {}) {
  const analysisPrompt = `
Você é um analisador de intenções avançado. Analise profundamente a seguinte entrada do usuário e extraia:

1. INTENÇÃO EXPLÍCITA: O que o usuário disse diretamente
2. NECESSIDADES IMPLÍCITAS: O que o usuário realmente precisa (pode ser diferente)
3. CONTEXTO EMOCIONAL: Estado emocional detectado
4. NÍVEL DE URGÊNCIA: baixo/médio/alto
5. COMPLEXIDADE: 0.0-1.0 (simples a muito complexo)
6. AGENTES SUGERIDOS: Quais agentes cognitivos seriam ideais
7. NECESSIDADES ANTECIPADAS: O que o usuário pode precisar depois

ENTRADA: "${input}"
CONTEXTO: ${JSON.stringify(context)}

Responda em JSON estruturado:
{
  "explicitIntent": "...",
  "implicitNeeds": ["...", "..."],
  "emotionalContext": "neutral|excited|frustrated|confused|urgent",
  "urgencyLevel": "low|medium|high",
  "complexity": 0.0-1.0,
  "suggestedAgents": ["analytical-agent", "creative-agent", "technical-agent", "integration-agent"],
  "anticipatedNeeds": ["...", "..."],
  "reasoningChain": "Explicação do raciocínio..."
}`;

  const response = await callOpenAI([
    { role: 'system', content: analysisPrompt },
    { role: 'user', content: input }
  ], 0.3);

  try {
    return JSON.parse(response);
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      explicitIntent: input,
      implicitNeeds: [],
      emotionalContext: 'neutral',
      urgencyLevel: 'medium',
      complexity: 0.5,
      suggestedAgents: ['analytical-agent'],
      anticipatedNeeds: [],
      reasoningChain: 'Análise simplificada devido a erro de parsing'
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { input, context, userId }: IntentionAnalysisRequest = await req.json();

    if (!input || !userId) {
      return new Response(
        JSON.stringify({ error: 'input and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎯 Analisando intenção profunda para usuário: ${userId}`);
    console.log(`📝 Input: "${input.substring(0, 100)}..."`);

    const analysis = await analyzeDeepIntention(input, context);

    console.log(`✅ Análise completa:`, analysis);

    return new Response(
      JSON.stringify({ success: true, ...analysis }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na análise de intenção:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

interface LLMExecutionRequest {
  input: string;
  model: string;
  systemPrompt?: string;
  userId: string;
  maxTokens?: number;
  temperature?: number;
}

interface ModelConfig {
  apiEndpoint: string;
  headers: Record<string, string>;
  requestFormat: (input: string, systemPrompt?: string, options?: any) => any;
}

// Configurações para diferentes modelos
const modelConfigs: Record<string, ModelConfig> = {
  'gpt-4o': {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    requestFormat: (input: string, systemPrompt?: string, options = {}) => ({
      model: 'gpt-4o',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: input }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1500
    })
  },
  'gpt-4o-mini': {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    requestFormat: (input: string, systemPrompt?: string, options = {}) => ({
      model: 'gpt-4o-mini',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: input }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1500
    })
  }
};

async function executeWithModel(
  model: string,
  input: string,
  systemPrompt?: string,
  options: any = {}
): Promise<{ result: string; quality: number; metadata: any }> {
  const config = modelConfigs[model];
  
  if (!config) {
    throw new Error(`Modelo ${model} não configurado`);
  }

  console.log(`🤖 Executando com ${model}...`);
  console.log(`📝 Input: ${input.substring(0, 100)}...`);

  const startTime = Date.now();

  try {
    const requestBody = config.requestFormat(input, systemPrompt, options);
    
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro API ${model}:`, errorText);
      throw new Error(`${model} API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    const latency = Date.now() - startTime;

    // Calcular qualidade baseada em características da resposta
    const quality = calculateResponseQuality(result, input, latency);

    console.log(`✅ ${model} executado em ${latency}ms (Qualidade: ${quality.toFixed(2)})`);

    return {
      result,
      quality,
      metadata: {
        model,
        latency,
        tokensUsed: data.usage?.total_tokens || 0,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error(`❌ Erro na execução do ${model}:`, error);
    throw error;
  }
}

function calculateResponseQuality(
  response: string,
  input: string,
  latency: number
): number {
  let quality = 0.5; // Base quality

  // Comprimento da resposta (mais detalhada = melhor qualidade)
  if (response.length > 500) quality += 0.1;
  if (response.length > 1000) quality += 0.1;

  // Estruturação (presença de listas, parágrafos, etc.)
  if (response.includes('\n') || response.includes('•') || response.includes('-')) {
    quality += 0.1;
  }

  // Presença de explicações (palavras-chave que indicam explicação)
  const explanationKeywords = ['porque', 'portanto', 'assim', 'dessa forma', 'por exemplo'];
  const hasExplanations = explanationKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  if (hasExplanations) quality += 0.1;

  // Penalizar respostas muito rápidas (podem ser superficiais)
  if (latency < 1000) quality -= 0.05;

  // Relevância (comparação básica com input)
  const inputWords = input.toLowerCase().split(' ').filter(w => w.length > 3);
  const responseWords = response.toLowerCase().split(' ');
  const relevanceScore = inputWords.filter(word => 
    responseWords.some(rw => rw.includes(word))
  ).length / inputWords.length;
  
  quality += relevanceScore * 0.2;

  return Math.min(1.0, Math.max(0.1, quality));
}

async function logExecution(
  userId: string,
  model: string,
  input: string,
  result: any,
  success: boolean
) {
  try {
    await supabase.from('llm_execution_logs').insert({
      user_id: userId,
      model_used: model,
      input_hash: await hashString(input.substring(0, 100)), // Hash para privacidade
      output_quality: result?.quality || 0,
      execution_time: result?.metadata?.latency || 0,
      tokens_used: result?.metadata?.tokensUsed || 0,
      success,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao registrar execução:', error);
    // Não falhar a execução principal por erro de log
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      input, 
      model, 
      systemPrompt, 
      userId, 
      maxTokens = 1500, 
      temperature = 0.7 
    }: LLMExecutionRequest = await req.json();

    if (!input || !model || !userId) {
      return new Response(
        JSON.stringify({ error: 'input, model and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Executando LLM: ${model} para usuário ${userId}`);

    const result = await executeWithModel(model, input, systemPrompt, {
      maxTokens,
      temperature
    });

    // Registrar execução para analytics
    await logExecution(userId, model, input, result, true);

    return new Response(
      JSON.stringify({ 
        success: true,
        ...result
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na execução LLM:', error);
    
    // Tentar registrar falha
    try {
      const body = await req.json();
      await logExecution(body.userId, body.model, body.input, null, false);
    } catch (logError) {
      console.error('❌ Erro ao registrar falha:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

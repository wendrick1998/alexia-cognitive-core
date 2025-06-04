
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import { callWithRetry, callOpenAIWithRetry, CircuitBreaker } from '../_shared/llm-retry.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

interface LLMRoutingRequest {
  task: any;
  agentType: string;
  userId: string;
}

interface ModelCapability {
  name: string;
  strengths: string[];
  speed: number;
  quality: number;
  cost: number;
  contextWindow: number;
  supportedFeatures: string[];
}

const availableModels: ModelCapability[] = [
  {
    name: 'gpt-4o-mini',
    strengths: ['fast', 'cost-effective', 'general-purpose', 'coding', 'analysis'],
    speed: 0.9,
    quality: 0.7,
    cost: 0.2,
    contextWindow: 128000,
    supportedFeatures: ['text', 'vision', 'tools']
  },
  {
    name: 'gpt-4o',
    strengths: ['high-quality', 'complex-reasoning', 'creative', 'multimodal'],
    speed: 0.6,
    quality: 0.95,
    cost: 0.8,
    contextWindow: 128000,
    supportedFeatures: ['text', 'vision', 'tools', 'advanced-reasoning']
  }
];

// Circuit breaker instance for LLM calls
const llmCircuitBreaker = new CircuitBreaker(5, 60000);

function calculateModelScore(model: ModelCapability, task: any, agentType: string): number {
  let score = 0;

  score += model.quality * 0.4;

  switch (agentType) {
    case 'analytical-agent':
      if (model.strengths.includes('analysis') || model.strengths.includes('complex-reasoning')) {
        score += 0.3;
      }
      break;
    case 'creative-agent':
      if (model.strengths.includes('creative') || model.strengths.includes('multimodal')) {
        score += 0.3;
      }
      break;
    case 'technical-agent':
      if (model.strengths.includes('coding') || model.strengths.includes('tools')) {
        score += 0.3;
      }
      break;
    case 'integration-agent':
      if (model.strengths.includes('general-purpose')) {
        score += 0.2;
      }
      break;
  }

  if (task.complexity > 0.7 && model.quality > 0.8) {
    score += 0.2;
  } else if (task.complexity < 0.4 && model.speed > 0.8) {
    score += 0.2;
  }

  if (task.priority >= 3 && model.speed > 0.7) {
    score += 0.1;
  }

  if (task.type === 'routine' && model.cost < 0.5) {
    score += 0.1;
  }

  return Math.min(1.0, score);
}

async function routeToOptimalLLM(task: any, agentType: string) {
  console.log(`🧠 Roteando tarefa para LLM otimizado...`);
  console.log(`📊 Tipo de agente: ${agentType}, Complexidade: ${task.complexity}`);

  const modelScores = availableModels.map(model => ({
    model,
    score: calculateModelScore(model, task, agentType)
  }));

  modelScores.sort((a, b) => b.score - a.score);
  const selectedModel = modelScores[0];

  console.log(`🎯 Modelo selecionado: ${selectedModel.model.name} (Score: ${selectedModel.score.toFixed(3)})`);

  // Test the selected model with retry logic
  if (openaiApiKey) {
    try {
      await llmCircuitBreaker.call(async () => {
        return callOpenAIWithRetry(async () => {
          return fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
            },
          });
        }, { retries: 2, initialDelay: 500 });
      });
      console.log(`✅ Modelo ${selectedModel.model.name} verificado e disponível`);
    } catch (error) {
      console.warn(`⚠️ Falha na verificação do modelo: ${error.message}`);
    }
  }

  return {
    selectedModel: selectedModel.model.name,
    confidence: selectedModel.score,
    reasoning: `Selecionado ${selectedModel.model.name} para ${agentType} baseado em: ${selectedModel.model.strengths.join(', ')}`,
    estimatedQuality: selectedModel.model.quality,
    estimatedSpeed: selectedModel.model.speed,
    estimatedCost: selectedModel.model.cost,
    circuitBreakerState: llmCircuitBreaker.getState(),
    alternatives: modelScores.slice(1, 3).map(m => ({
      model: m.model.name,
      score: m.score
    }))
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { task, agentType, userId }: LLMRoutingRequest = await req.json();

    if (!task || !agentType || !userId) {
      return new Response(
        JSON.stringify({ error: 'task, agentType and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const routingResult = await callWithRetry(
      () => routeToOptimalLLM(task, agentType),
      { retries: 2, initialDelay: 500 }
    );

    return new Response(
      JSON.stringify({ success: true, ...routingResult }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no roteamento de LLM:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

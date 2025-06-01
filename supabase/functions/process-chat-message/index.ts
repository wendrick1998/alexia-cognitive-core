
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import type { ChatRequest, ChatResponse } from './types.ts';
import { generateEmbedding, callOpenAI } from './openai-service.ts';
import { searchDocuments, searchMemories } from './search-service.ts';
import { logRetrievedChunks, logPromptData } from './logging-service.ts';
import { saveMessages } from './message-service.ts';
import { 
  getRecentConversationHistory, 
  enhanceQueryWithSessionContext 
} from './conversation-service.ts';
import { saveConversationInsight } from './memory-insights-service.ts';
import { 
  buildEnhancedSystemPrompt, 
  buildActiveSessionPrompt 
} from './enhanced-prompt-service.ts';

// Importar cache semântico
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Função para gerar embedding usando OpenAI
async function generateCacheEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8191),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding for cache:', error);
    return new Array(1536).fill(0);
  }
}

// Função para detectar tipo de tarefa
function detectTaskType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('código') || lowerMessage.includes('code') || lowerMessage.includes('função')) {
    return 'code_generation';
  }
  if (lowerMessage.includes('analis') || lowerMessage.includes('avaliar') || lowerMessage.includes('comparar')) {
    return 'analysis';
  }
  if (lowerMessage.includes('criar') || lowerMessage.includes('escrever') || lowerMessage.includes('história')) {
    return 'creative_writing';
  }
  if (lowerMessage.includes('plano') || lowerMessage.includes('estratégia') || lowerMessage.includes('organizar')) {
    return 'planning';
  }
  if (lowerMessage.includes('pesquis') || lowerMessage.includes('investigar')) {
    return 'research';
  }
  if (lowerMessage.includes('documento') || lowerMessage.includes('arquivo') || lowerMessage.includes('pdf')) {
    return 'document_analysis';
  }
  if (lowerMessage.includes('lembr') || lowerMessage.includes('memória') || lowerMessage.includes('anterior')) {
    return 'memory_retrieval';
  }
  
  return 'general';
}

// Função para buscar no cache semântico
async function searchSemanticCache(
  question: string, 
  taskType: string, 
  userId: string
): Promise<string | null> {
  try {
    console.log(`🔍 Buscando no cache semântico: "${question.substring(0, 50)}..."`);
    
    // Gerar embedding para a pergunta
    const embedding = await generateCacheEmbedding(question);
    
    // Calcular timestamp mínimo (7 dias atrás)
    const minTimestamp = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Buscar no cache usando a função RPC
    const { data, error } = await supabase.rpc('match_question_embeddings', {
      query_embedding: embedding,
      similarity_threshold: 0.85,
      match_count: 1,
      min_created_at: minTimestamp,
      task_type: taskType
    });
    
    if (error) {
      console.error('Erro na busca do cache:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log(`🎯 Cache HIT! Similaridade: ${(result.similarity * 100).toFixed(1)}%`);
      
      // Registrar hit do cache
      await supabase.from('llm_cache_metrics').insert({
        cache_item_id: result.id,
        user_id: userId
      });
      
      return result.answer;
    }
    
    console.log('❌ Cache MISS: Nenhuma resposta similar encontrada');
    return null;
  } catch (error) {
    console.error('Erro na busca do cache semântico:', error);
    return null;
  }
}

// Função para salvar no cache semântico
async function saveToSemanticCache(
  question: string,
  answer: string,
  taskType: string,
  modelName: string,
  tokensUsed: number,
  userId: string
): Promise<void> {
  try {
    console.log(`💾 Salvando no cache semântico...`);
    
    // Gerar embedding para a pergunta
    const embedding = await generateCacheEmbedding(question);
    
    // Inserir no cache
    const { error } = await supabase
      .from('llm_response_cache')
      .insert({
        question,
        answer,
        embedding,
        task_type: taskType,
        model_name: modelName,
        provider: 'openai',
        tokens_used: tokensUsed,
        user_id: userId,
        metadata: {}
      });
    
    if (error) {
      console.error('Erro ao salvar no cache:', error);
    } else {
      console.log('✅ Resposta salva no cache semântico');
    }
  } catch (error) {
    console.error('Erro ao salvar no cache semântico:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_message, user_id, project_id, conversation_id }: ChatRequest = await req.json();
    
    if (!user_message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'user_message and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Processando mensagem com cache semântico ativo para usuário: ${user_id}`);
    console.log(`📝 Mensagem: "${user_message.substring(0, 100)}..."`);

    // 1. Detectar tipo de tarefa
    const taskType = detectTaskType(user_message);
    console.log(`🎯 Tipo de tarefa detectado: ${taskType}`);

    // 2. PRIORIDADE: Buscar no cache semântico primeiro
    const cachedResponse = await searchSemanticCache(user_message, taskType, user_id);
    
    if (cachedResponse) {
      console.log(`⚡ Retornando resposta do cache semântico`);
      
      const response: ChatResponse = {
        response: cachedResponse,
        context_used: true,
        chunks_found: 0,
        memories_found: 0,
        cached_response: true
      };

      // Salvar mensagens se houver conversa
      if (conversation_id) {
        await saveMessages(conversation_id, user_message, cachedResponse);
      }

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. CACHE MISS: Processar normalmente com memória de sessão ativa
    const conversationHistory = conversation_id ? 
      await getRecentConversationHistory(conversation_id, 10) : [];

    console.log(`🧠 Memória de sessão: ${conversationHistory.length} interações carregadas`);

    // 4. Enriquecer query com contexto da sessão
    const enhancedQuery = enhanceQueryWithSessionContext(user_message, conversationHistory);
    console.log(`🔍 Query para busca semântica: "${enhancedQuery.substring(0, 100)}..."`);

    // 5. Gerar embedding para a query enriquecida
    const queryEmbedding = await generateEmbedding(enhancedQuery);

    // 6. Buscar em documentos e memórias
    const documentChunks = await searchDocuments(queryEmbedding, user_id);
    const memoryChunks = await searchMemories(queryEmbedding, user_id);

    console.log(`📊 Resultados: ${documentChunks.length} chunks de documentos, ${memoryChunks.length} chunks de memórias`);

    // 7. Log diagnóstico
    logRetrievedChunks(documentChunks, memoryChunks, user_message);

    // 8. Construir prompt com prioridade para memória de sessão ativa
    const fullPrompt = buildActiveSessionPrompt(
      documentChunks, 
      memoryChunks, 
      conversationHistory, 
      user_message
    );

    // 9. Log do prompt completo
    logPromptData('', user_message, fullPrompt);

    // 10. Chamar LLM com sistema aprimorado
    const systemPrompt = buildEnhancedSystemPrompt();
    const aiResponse = await callOpenAI(fullPrompt, systemPrompt);

    // 11. Salvar no cache semântico para futuras consultas
    await saveToSemanticCache(
      user_message,
      aiResponse,
      taskType,
      'gpt-4o-mini',
      Math.ceil(aiResponse.length / 4), // Estimativa de tokens
      user_id
    );

    // 12. Salvar mensagens na conversa atual
    if (conversation_id) {
      await saveMessages(conversation_id, user_message, aiResponse);
    }

    // 13. Avaliar e salvar insights derivados da conversa (em background)
    if (conversation_id) {
      saveConversationInsight(user_message, aiResponse, user_id, conversation_id)
        .catch(error => console.error('Erro ao salvar insight em background:', error));
    }

    const response: ChatResponse = {
      response: aiResponse,
      context_used: documentChunks.length > 0 || memoryChunks.length > 0 || conversationHistory.length > 0,
      chunks_found: documentChunks.length,
      memories_found: memoryChunks.length,
      cached_response: false
    };

    console.log(`✅ Resposta gerada e salva no cache (${conversationHistory.length} turnos de contexto)`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na função process-chat-message com cache semântico:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

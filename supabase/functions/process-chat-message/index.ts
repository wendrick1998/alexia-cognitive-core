
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log(`🚀 Processando mensagem com memória de sessão ativa para usuário: ${user_id}`);
    console.log(`📝 Mensagem: "${user_message.substring(0, 100)}..."`);

    // 1. PRIORIDADE MÁXIMA: Recuperar histórico da conversa atual (memória de sessão)
    const conversationHistory = conversation_id ? 
      await getRecentConversationHistory(conversation_id, 10) : [];

    console.log(`🧠 Memória de sessão: ${conversationHistory.length} interações carregadas`);

    // 2. Enriquecer query com contexto da sessão para perguntas contextuais
    const enhancedQuery = enhanceQueryWithSessionContext(user_message, conversationHistory);
    console.log(`🔍 Query para busca semântica: "${enhancedQuery.substring(0, 100)}..."`);

    // 3. Gerar embedding para a query enriquecida
    const queryEmbedding = await generateEmbedding(enhancedQuery);

    // 4. Buscar em documentos e memórias
    const documentChunks = await searchDocuments(queryEmbedding, user_id);
    const memoryChunks = await searchMemories(queryEmbedding, user_id);

    console.log(`📊 Resultados: ${documentChunks.length} chunks de documentos, ${memoryChunks.length} chunks de memórias`);

    // 5. Log diagnóstico
    logRetrievedChunks(documentChunks, memoryChunks, user_message);

    // 6. Construir prompt com prioridade para memória de sessão ativa
    const fullPrompt = buildActiveSessionPrompt(
      documentChunks, 
      memoryChunks, 
      conversationHistory, 
      user_message
    );

    // 7. Log do prompt completo
    logPromptData('', user_message, fullPrompt);

    // 8. Chamar LLM com sistema aprimorado para memória de sessão
    const systemPrompt = buildEnhancedSystemPrompt();
    const aiResponse = await callOpenAI(fullPrompt, systemPrompt);

    // 9. Salvar mensagens na conversa atual
    if (conversation_id) {
      await saveMessages(conversation_id, user_message, aiResponse);
    }

    // 10. Avaliar e salvar insights derivados da conversa (em background)
    if (conversation_id) {
      saveConversationInsight(user_message, aiResponse, user_id, conversation_id)
        .catch(error => console.error('Erro ao salvar insight em background:', error));
    }

    const response: ChatResponse = {
      response: aiResponse,
      context_used: documentChunks.length > 0 || memoryChunks.length > 0 || conversationHistory.length > 0,
      chunks_found: documentChunks.length,
      memories_found: memoryChunks.length
    };

    console.log(`✅ Resposta gerada com memória de sessão ativa (${conversationHistory.length} turnos de contexto)`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na função process-chat-message com memória de sessão:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

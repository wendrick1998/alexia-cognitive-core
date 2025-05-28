
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import type { ChatRequest, ChatResponse } from './types.ts';
import { generateEmbedding, callOpenAI } from './openai-service.ts';
import { searchDocuments, searchMemories, buildContextText } from './search-service.ts';
import { logRetrievedChunks, logPromptData } from './logging-service.ts';
import { saveMessages } from './message-service.ts';

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

    console.log(`Processing chat message for user: ${user_id}, message: "${user_message.substring(0, 100)}..."`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(user_message);

    // Search documents and memories
    const documentChunks = await searchDocuments(queryEmbedding, user_id);
    const memoryChunks = await searchMemories(queryEmbedding, user_id);

    console.log(`Found ${documentChunks.length} document chunks and ${memoryChunks.length} memory chunks`);

    // Enhanced diagnostic logging
    logRetrievedChunks(documentChunks, memoryChunks, user_message);

    // Build context for LLM
    const contextText = buildContextText(documentChunks, memoryChunks);
    const fullPrompt = `${contextText}Pergunta do Usuário: ${user_message}\n\nResposta de Alex iA:`;

    // Log complete prompt with clear delimiters
    logPromptData(contextText, user_message, fullPrompt);

    // Call LLM
    const aiResponse = await callOpenAI(fullPrompt);

    // Save messages to database
    await saveMessages(conversation_id || '', user_message, aiResponse);

    const response: ChatResponse = {
      response: aiResponse,
      context_used: documentChunks.length > 0 || memoryChunks.length > 0,
      chunks_found: documentChunks.length,
      memories_found: memoryChunks.length
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-chat-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

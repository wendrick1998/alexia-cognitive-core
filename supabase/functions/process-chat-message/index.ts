
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8191),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function callOpenAI(prompt: string): Promise<string> {
  console.log('Calling OpenAI with prompt length:', prompt.length);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é Alex iA, um assistente IA prestativo. Responda à pergunta do usuário baseando-se estritamente no contexto fornecido. Se a informação não estiver no contexto, diga que não encontrou a informação nos documentos atuais. Seja claro, conciso e útil.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_message, user_id, project_id, conversation_id } = await req.json();
    
    if (!user_message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'user_message and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing chat message for user: ${user_id}, message: "${user_message.substring(0, 100)}..."`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(user_message);

    // Step 1: Search document sections using enhanced RPC
    console.log('=== DOCUMENT SEARCH ===');
    const { data: documentResults, error: docError } = await supabase.rpc('match_document_sections', {
      p_query_embedding: queryEmbedding,
      p_match_similarity_threshold: 0.7,
      p_match_count: 3,
      p_user_id_filter: user_id
    });

    if (docError) {
      console.error('Error in document search:', docError);
    }

    // Step 2: Search cognitive memories using enhanced RPC
    console.log('=== MEMORY SEARCH ===');
    const { data: memoryResults, error: memError } = await supabase.rpc('search_cognitive_memories', {
      p_query_embedding: queryEmbedding,
      p_match_similarity_threshold: 0.7,
      p_match_count: 2,
      p_user_id_filter: user_id
    });

    if (memError) {
      console.error('Error in memory search:', memError);
    }

    const documentChunks = documentResults || [];
    const memoryChunks = memoryResults || [];

    console.log(`Found ${documentChunks.length} document chunks and ${memoryChunks.length} memory chunks`);

    // Step 3: Build context for LLM
    let contextText = '';
    
    if (documentChunks.length > 0) {
      contextText += 'Contexto dos Documentos:\n';
      documentChunks.forEach((chunk: any, index: number) => {
        contextText += `---\n[Trecho ${index + 1} - Similaridade: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.content}\n`;
      });
      contextText += '---\n\n';
    }

    if (memoryChunks.length > 0) {
      contextText += 'Memórias Relevantes:\n';
      memoryChunks.forEach((memory: any, index: number) => {
        contextText += `---\n[Memória ${index + 1} - ${memory.source || 'Sistema'} - Similaridade: ${(memory.similarity * 100).toFixed(1)}%]\n${memory.content}\n`;
      });
      contextText += '---\n\n';
    }

    if (!contextText) {
      contextText = 'Nenhum contexto relevante encontrado nos documentos ou memórias.\n\n';
    }

    const fullPrompt = `${contextText}Pergunta do Usuário: ${user_message}\n\nResposta de Alex iA:`;

    console.log('=== PROMPT COMPLETO PARA LLM ===');
    console.log('Tamanho total do prompt:', fullPrompt.length, 'caracteres');

    // Step 4: Call LLM
    const aiResponse = await callOpenAI(fullPrompt);

    // Step 5: Save messages to database
    if (conversation_id) {
      // Save user message
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation_id,
          role: 'user',
          content: user_message,
        });

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
      }

      // Save AI response
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation_id,
          role: 'assistant',
          content: aiResponse,
          llm_used: 'gpt-4o-mini'
        });

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError);
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        context_used: documentChunks.length > 0 || memoryChunks.length > 0,
        chunks_found: documentChunks.length,
        memories_found: memoryChunks.length
      }),
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

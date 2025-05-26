
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

    // Passo 1: Recuperação de Contexto via busca semântica
    console.log('=== SEMANTIC SEARCH DEBUG ===');
    console.log(`Calling semantic-search function with query: "${user_message}"`);
    console.log(`Project ID: ${project_id || 'none'}`);
    console.log(`User ID: ${user_id}`);
    
    const { data: searchData, error: searchError } = await supabase.functions.invoke('semantic-search', {
      body: { 
        query_text: user_message,
        user_id: user_id,
        project_id: project_id,
        top_n: 3
      }
    });

    if (searchError) {
      console.error('ERROR in semantic-search function:', searchError);
      console.log('Search error details:', JSON.stringify(searchError, null, 2));
    } else {
      console.log('Semantic search completed successfully');
    }

    const searchResults = searchData?.results || [];
    console.log(`=== SEARCH RESULTS (${searchResults.length} chunks found) ===`);
    
    if (searchResults.length === 0) {
      console.log(`⚠️  NENHUM CHUNK ENCONTRADO pela busca semântica para a query: "${user_message}"`);
      console.log('Search data received:', JSON.stringify(searchData, null, 2));
    } else {
      console.log('📄 CHUNKS RECUPERADOS:');
      searchResults.forEach((result: any, index: number) => {
        console.log(`--- CHUNK ${index + 1} ---`);
        console.log(`Documento: "${result.document_name || 'N/A'}"`);
        console.log(`Pontuação de similaridade: ${result.similarity_score || 'N/A'}`);
        console.log(`Índice do chunk: ${result.chunk_index || 'N/A'}`);
        console.log(`Conteúdo (${result.content?.length || 0} caracteres):`);
        console.log(`"${result.content?.substring(0, 300) || 'N/A'}${result.content?.length > 300 ? '...' : ''}"`);
        console.log('--- FIM CHUNK ---');
      });
    }

    // Passo 2: Construção do Prompt para o LLM
    let contextText = '';
    if (searchResults.length > 0) {
      contextText = 'Contexto Fornecido:\n';
      searchResults.forEach((result: any, index: number) => {
        contextText += `---\n[Trecho ${index + 1} do documento "${result.document_name}"]\n${result.content}\n`;
      });
      contextText += '---\n\n';
    } else {
      contextText = 'Nenhum contexto relevante encontrado nos documentos atuais.\n\n';
    }

    const fullPrompt = `${contextText}Pergunta do Usuário: ${user_message}\n\nResposta de Alex iA:`;

    console.log('=== PROMPT COMPLETO PARA LLM ===');
    console.log('Tamanho total do prompt:', fullPrompt.length, 'caracteres');
    console.log('--- INÍCIO DO PROMPT ---');
    console.log(fullPrompt);
    console.log('--- FIM DO PROMPT ---');

    // Passo 3: Chamada ao LLM
    console.log('=== CHAMANDO OPENAI ===');
    console.log('Enviando prompt para OpenAI...');
    const aiResponse = await callOpenAI(fullPrompt);
    
    console.log('=== RESPOSTA DO LLM ===');
    console.log(`Resposta recebida (${aiResponse.length} caracteres):`);
    console.log(`"${aiResponse.substring(0, 200)}${aiResponse.length > 200 ? '...' : ''}"`);

    // Passo 4: Salvar mensagens no banco de dados
    if (conversation_id) {
      // Salvar mensagem do usuário
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

      // Salvar resposta da IA
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

    console.log('=== PROCESSO CONCLUÍDO ===');
    console.log('Retornando resposta para o cliente');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        context_used: searchResults.length > 0,
        chunks_found: searchResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== ERRO NA FUNÇÃO ===');
    console.error('Error in process-chat-message function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import { callOpenAIWithRetry, CircuitBreaker } from '../_shared/llm-retry.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Circuit breaker for embedding generation
const embeddingCircuitBreaker = new CircuitBreaker(3, 30000);

async function generateEmbedding(text: string): Promise<number[]> {
  console.log(`Generating embedding for query text: ${text.substring(0, 100)}...`);
  
  try {
    const data = await embeddingCircuitBreaker.call(async () => {
      return callOpenAIWithRetry(async () => {
        return fetch('https://api.openai.com/v1/embeddings', {
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
      }, { 
        retries: 3, 
        initialDelay: 1000,
        maxDelay: 5000 
      });
    });

    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query_text, user_id, project_id, top_n = 5, similarity_threshold = 0.7 } = await req.json();
    
    if (!query_text || !user_id) {
      return new Response(
        JSON.stringify({ error: 'query_text and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing semantic search for user: ${user_id}, query: "${query_text}"`);
    console.log(`Using similarity threshold: ${similarity_threshold}, top_n: ${top_n}`);
    console.log(`🔄 Embedding circuit breaker state: ${embeddingCircuitBreaker.getState()}`);

    const queryEmbedding = await generateEmbedding(query_text);

    const { data: searchResults, error } = await supabase.rpc('match_document_sections', {
      p_query_embedding: queryEmbedding,
      p_match_similarity_threshold: similarity_threshold,
      p_match_count: top_n,
      p_user_id_filter: user_id
    });

    if (error) {
      console.error('Error in similarity search:', error);
      throw error;
    }

    console.log(`Found ${searchResults?.length || 0} similar sections`);

    const formattedResults = (searchResults || []).map((result: any) => ({
      content: result.content,
      document_name: 'Document',
      chunk_index: 0,
      similarity_score: result.similarity
    }));

    return new Response(
      JSON.stringify({ 
        results: formattedResults,
        query: query_text,
        total_results: searchResults?.length || 0,
        similarity_threshold_used: similarity_threshold,
        circuit_breaker_state: embeddingCircuitBreaker.getState()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in semantic-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

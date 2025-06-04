
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query_text, user_id, top_n = 5, similarity_threshold = 0.7 } = await req.json();
    
    console.log(`Semantic search for user: ${user_id}, query: "${query_text}"`);
    
    // Stub response for now
    const response = {
      results: [
        {
          content: `Resultado de exemplo para a busca: "${query_text}"`,
          document_name: "Documento de Teste",
          chunk_index: 0,
          similarity_score: 0.95
        }
      ],
      query: query_text,
      total_results: 1,
      similarity_threshold_used: similarity_threshold
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in semantic-search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

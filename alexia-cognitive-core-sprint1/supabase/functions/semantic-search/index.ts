
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
  console.log(`Generating embedding for query text: ${text.substring(0, 100)}...`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8191), // OpenAI has a token limit
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

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query_text);

    // Use the new enhanced RPC function with improved similarity logic
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

    // Format results to match expected interface
    const formattedResults = (searchResults || []).map((result: any) => ({
      content: result.content,
      document_name: 'Document', // We'll need to join with documents table if title is needed
      chunk_index: 0, // This would need to be section_number if available
      similarity_score: result.similarity
    }));

    return new Response(
      JSON.stringify({ 
        results: formattedResults,
        query: query_text,
        total_results: searchResults?.length || 0,
        similarity_threshold_used: similarity_threshold
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

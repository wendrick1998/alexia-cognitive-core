
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
  console.log(`Generating embedding for neural search: ${text.substring(0, 100)}...`);
  
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      query, 
      searchType = 'general', 
      limit = 10, 
      userId,
      similarityThreshold = 0.7,
      boostActivation = true
    } = await req.json();
    
    if (!query || !userId) {
      return new Response(
        JSON.stringify({ error: 'query and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing neural cognitive search for user: ${userId}`);
    console.log(`Query: "${query}", Type: ${searchType}, Limit: ${limit}`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Use enhanced neural search function
    const { data: searchResults, error } = await supabase.rpc('neural_cognitive_search', {
      p_user_id: userId,
      p_query_embedding: queryEmbedding,
      p_search_type: searchType,
      p_limit: limit,
      p_similarity_threshold: similarityThreshold,
      p_boost_activation: boostActivation
    });

    if (error) {
      console.error('Error in neural cognitive search:', error);
      throw error;
    }

    console.log(`Neural search completed: ${searchResults?.length || 0} results found`);

    // Trigger spreading activation for top results if requested
    if (boostActivation && searchResults && searchResults.length > 0) {
      const topResult = searchResults[0];
      
      // Trigger spreading activation for the most relevant result
      try {
        await supabase.rpc('spread_activation', {
          source_node_id: topResult.id,
          activation_boost: 0.2,
          max_depth: 2
        });
        console.log('Spreading activation triggered for top result');
      } catch (activationError) {
        console.error('Error triggering spreading activation:', activationError);
        // Don't fail the search if activation fails
      }
    }

    return new Response(
      JSON.stringify({ 
        results: searchResults || [],
        query,
        searchType,
        totalResults: searchResults?.length || 0,
        neuralEnhanced: true,
        activationBoosted: boostActivation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in neural cognitive search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

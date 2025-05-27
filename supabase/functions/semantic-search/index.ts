
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
    const { query_text, user_id, project_id, top_n = 5 } = await req.json();
    
    if (!query_text || !user_id) {
      return new Response(
        JSON.stringify({ error: 'query_text and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing semantic search for user: ${user_id}, query: "${query_text}"`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query_text);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Build the query to search for similar sections (updated table name)
    let searchQuery = supabase
      .from('document_sections') // Updated table name
      .select(`
        content,
        section_number,
        document_id,
        documents!inner(
          title,
          user_id,
          project_id
        )
      `)
      .eq('documents.user_id', user_id);

    // Add project filter if provided
    if (project_id) {
      if (project_id === 'none') {
        searchQuery = searchQuery.is('documents.project_id', null);
      } else {
        searchQuery = searchQuery.eq('documents.project_id', project_id);
      }
    }

    // Execute the similarity search using raw SQL through RPC
    const { data: searchResults, error } = await supabase.rpc('search_similar_chunks', {
      query_embedding: embeddingString,
      target_user_id: user_id,
      target_project_id: project_id,
      match_count: top_n
    });

    if (error) {
      console.error('Error in similarity search:', error);
      
      // Fallback to basic search without similarity scoring
      const { data: fallbackResults, error: fallbackError } = await searchQuery.limit(top_n);
      
      if (fallbackError) {
        throw fallbackError;
      }

      const formattedResults = (fallbackResults || []).map(section => ({
        content: section.content,
        document_name: section.documents.title, // Updated field name
        section_number: section.section_number, // Updated field name
        similarity_score: 0.5 // Default score for fallback
      }));

      return new Response(
        JSON.stringify({ 
          results: formattedResults,
          fallback: true,
          message: 'Used fallback search without similarity scoring'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${searchResults?.length || 0} similar sections`);

    return new Response(
      JSON.stringify({ 
        results: searchResults || [],
        query: query_text,
        total_results: searchResults?.length || 0
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

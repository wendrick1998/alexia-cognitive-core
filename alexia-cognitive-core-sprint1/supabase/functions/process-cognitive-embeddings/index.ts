
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
  console.log(`Generating embedding for text: ${text.substring(0, 100)}...`);
  
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

async function extractConceptualKeywords(text: string): Promise<string[]> {
  console.log('Extracting conceptual keywords...');
  
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
            content: 'Extract the most important conceptual keywords and themes from the given text. Return only the keywords, separated by commas, max 10 keywords.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const keywords = data.choices[0].message.content.split(',').map((k: string) => k.trim());
    return keywords;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nodeId, content } = await req.json();
    
    if (!nodeId || !content) {
      return new Response(
        JSON.stringify({ error: 'nodeId and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing embeddings for cognitive node: ${nodeId}`);

    // 1. Generate general embedding
    const generalEmbedding = await generateEmbedding(content);

    // 2. Extract conceptual keywords and generate conceptual embedding
    const keywords = await extractConceptualKeywords(content);
    const conceptualText = keywords.join(' ');
    const conceptualEmbedding = conceptualText ? await generateEmbedding(conceptualText) : null;

    // 3. Generate relational embedding (focusing on relationships and context)
    const relationalPrompt = `Context and relationships in: ${content}`;
    const relationalEmbedding = await generateEmbedding(relationalPrompt);

    // 4. Update the cognitive node with embeddings
    const { error: updateError } = await supabase
      .from('cognitive_nodes')
      .update({
        embedding_general: JSON.stringify(generalEmbedding),
        embedding_conceptual: conceptualEmbedding ? JSON.stringify(conceptualEmbedding) : null,
        embedding_relational: JSON.stringify(relationalEmbedding),
        metadata: {
          keywords,
          embeddings_processed_at: new Date().toISOString()
        }
      })
      .eq('id', nodeId);

    if (updateError) {
      console.error('Error updating cognitive node:', updateError);
      throw updateError;
    }

    console.log(`Successfully processed embeddings for node: ${nodeId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        nodeId,
        keywords,
        embeddingsGenerated: {
          general: true,
          conceptual: !!conceptualEmbedding,
          relational: true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-cognitive-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

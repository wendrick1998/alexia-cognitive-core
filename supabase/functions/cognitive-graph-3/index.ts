
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ConsolidationRequest {
  userId: string;
  operation: 'consolidate' | 'discover_clusters' | 'cleanup_buffer' | 'generate_embeddings';
  options?: {
    thresholdHours?: number;
    minClusterSize?: number;
    similarityThreshold?: number;
    content?: string;
    embeddingType?: 'semantic' | 'contextual';
  };
}

// Generate embeddings using OpenAI API
async function generateEmbeddings(text: string, type: 'semantic' | 'contextual' = 'semantic') {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const model = type === 'semantic' ? 'text-embedding-3-small' : 'text-embedding-3-small';
  const dimensions = type === 'semantic' ? 768 : 384;

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: model,
      dimensions: dimensions
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Memory consolidation function
async function consolidateMemory(userId: string, thresholdHours: number = 6) {
  console.log(`🧠 Starting memory consolidation for user ${userId}`);
  
  const { data, error } = await supabase.rpc('consolidate_memory_session', {
    p_user_id: userId,
    p_threshold_hours: thresholdHours
  });

  if (error) {
    console.error('Memory consolidation error:', error);
    throw error;
  }

  return { sessionId: data, message: 'Memory consolidation completed' };
}

// Discover cognitive clusters
async function discoverClusters(userId: string, minClusterSize: number = 3, similarityThreshold: number = 0.8) {
  console.log(`🔍 Discovering cognitive clusters for user ${userId}`);
  
  const { data, error } = await supabase.rpc('discover_cognitive_clusters', {
    p_user_id: userId,
    p_min_cluster_size: minClusterSize,
    p_similarity_threshold: similarityThreshold
  });

  if (error) {
    console.error('Cluster discovery error:', error);
    throw error;
  }

  return { clustersFound: data, message: 'Cluster discovery completed' };
}

// Cleanup expired short-term memory
async function cleanupBuffer() {
  console.log('🧹 Cleaning up expired short-term memory');
  
  const { error } = await supabase.rpc('cleanup_expired_short_term_memory');

  if (error) {
    console.error('Buffer cleanup error:', error);
    throw error;
  }

  return { message: 'Buffer cleanup completed' };
}

// Generate and store multiple embedding types
async function generateMultipleEmbeddings(content: string, nodeId: string) {
  console.log(`🧮 Generating multiple embeddings for node ${nodeId}`);
  
  try {
    // Generate semantic and contextual embeddings
    const semanticEmbedding = await generateEmbeddings(content, 'semantic');
    const contextualEmbedding = await generateEmbeddings(content, 'contextual');

    // Update node with new embeddings
    const { error } = await supabase
      .from('cognitive_nodes')
      .update({
        embedding_semantic: JSON.stringify(semanticEmbedding),
        embedding_contextual: JSON.stringify(contextualEmbedding),
        updated_at: new Date().toISOString()
      })
      .eq('id', nodeId);

    if (error) throw error;

    return { 
      message: 'Multiple embeddings generated successfully',
      semanticDimensions: semanticEmbedding.length,
      contextualDimensions: contextualEmbedding.length
    };
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
}

// Add interaction to short-term memory buffer
async function addToShortTermBuffer(userId: string, interactionData: any) {
  console.log(`📝 Adding interaction to short-term buffer for user ${userId}`);
  
  // Get current buffer position
  const { data: bufferData } = await supabase
    .from('short_term_memory')
    .select('buffer_position')
    .eq('user_id', userId)
    .order('buffer_position', { ascending: false })
    .limit(1);

  const nextPosition = bufferData && bufferData.length > 0 ? bufferData[0].buffer_position + 1 : 1;

  // Calculate importance score based on interaction type
  const importanceScore = calculateImportanceScore(interactionData);

  const { data, error } = await supabase
    .from('short_term_memory')
    .insert({
      user_id: userId,
      interaction_data: interactionData,
      cognitive_context: {
        timestamp: new Date().toISOString(),
        session_context: 'web_interface'
      },
      importance_score: importanceScore,
      buffer_position: nextPosition
    })
    .select()
    .single();

  if (error) {
    console.error('Short-term buffer error:', error);
    throw error;
  }

  return { bufferId: data.id, position: nextPosition };
}

// Calculate importance score for interactions
function calculateImportanceScore(interactionData: any): number {
  let score = 0.5; // Base score

  // Boost score based on interaction type
  if (interactionData.type === 'insight') score += 0.3;
  if (interactionData.type === 'decision') score += 0.2;
  if (interactionData.type === 'pattern') score += 0.2;
  
  // Boost score based on content length (longer = more complex)
  if (interactionData.content && interactionData.content.length > 500) score += 0.1;
  
  // Boost score if related to existing high-activation nodes
  if (interactionData.relatedNodes && interactionData.relatedNodes.length > 0) score += 0.1;

  return Math.min(1.0, score);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, operation, options = {} }: ConsolidationRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (operation) {
      case 'consolidate':
        result = await consolidateMemory(userId, options.thresholdHours);
        break;
      
      case 'discover_clusters':
        result = await discoverClusters(
          userId, 
          options.minClusterSize, 
          options.similarityThreshold
        );
        break;
      
      case 'cleanup_buffer':
        result = await cleanupBuffer();
        break;
      
      case 'generate_embeddings':
        if (!options.content) {
          throw new Error('Content is required for embedding generation');
        }
        result = await generateMultipleEmbeddings(options.content, userId);
        break;
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cognitive Graph 3.0 function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

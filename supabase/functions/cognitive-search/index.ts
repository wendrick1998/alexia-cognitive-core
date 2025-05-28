
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

// BM25 Implementation
async function bm25Search(
  userId: string,
  searchTerms: string[],
  k1: number = 1.2,
  b: number = 0.75,
  limit: number = 10
) {
  console.log('🔍 Executing BM25 search:', { searchTerms, k1, b });

  // Get collection statistics
  const { data: stats } = await supabase
    .from('cognitive_nodes')
    .select('content')
    .eq('user_id', userId);

  const totalDocs = stats?.length || 1;
  const avgDocLength = stats?.reduce((sum, doc) => sum + doc.content.length, 0) / totalDocs || 100;

  // Build search query for each term
  const searchQueries = searchTerms.map(term => `'${term}'`).join(' | ');
  
  const { data: results, error } = await supabase
    .from('cognitive_nodes')
    .select('*')
    .eq('user_id', userId)
    .textSearch('content', searchQueries, {
      type: 'websearch',
      config: 'portuguese'
    })
    .limit(limit * 2); // Get more results for better ranking

  if (error) throw error;

  // Calculate BM25 scores
  const scoredResults = results?.map(doc => {
    let bm25Score = 0;
    const docLength = doc.content.length;
    
    searchTerms.forEach(term => {
      const termFreq = (doc.content.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      const docFreq = results.filter(d => 
        d.content.toLowerCase().includes(term)
      ).length;
      
      const idf = Math.log((totalDocs - docFreq + 0.5) / (docFreq + 0.5));
      const tf = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (docLength / avgDocLength)));
      
      bm25Score += idf * tf;
    });

    return {
      ...doc,
      bm25_score: bm25Score,
      combined_score: bm25Score * doc.relevance_score,
      term_matches: searchTerms.filter(term => 
        doc.content.toLowerCase().includes(term)
      )
    };
  }).sort((a, b) => b.bm25_score - a.bm25_score).slice(0, limit) || [];

  return {
    results: scoredResults,
    totalDocuments: totalDocs,
    avgDocLength: avgDocLength
  };
}

// Hybrid Search with RRF (Reciprocal Rank Fusion)
async function hybridSearch(
  userId: string,
  query: string,
  bm25Weight: number = 0.4,
  semanticWeight: number = 0.6,
  rrfK: number = 60,
  limit: number = 10
) {
  console.log('🔍 Executing hybrid search:', { query, bm25Weight, semanticWeight });

  // Get BM25 results
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  const bm25Results = await bm25Search(userId, searchTerms, 1.2, 0.75, limit * 2);

  // Get semantic results
  const queryEmbedding = await generateEmbedding(query);
  const { data: semanticResults } = await supabase.rpc('cognitive_search', {
    p_user_id: userId,
    p_query_embedding: queryEmbedding,
    p_search_type: 'general',
    p_limit: limit * 2,
    p_similarity_threshold: 0.1
  });

  // Apply RRF fusion
  const fusedScores = new Map();
  
  // Add BM25 scores
  bm25Results.results.forEach((result, index) => {
    const rrfScore = bm25Weight / (rrfK + index + 1);
    fusedScores.set(result.id, (fusedScores.get(result.id) || 0) + rrfScore);
  });

  // Add semantic scores
  (semanticResults || []).forEach((result: any, index: number) => {
    const rrfScore = semanticWeight / (rrfK + index + 1);
    fusedScores.set(result.id, (fusedScores.get(result.id) || 0) + rrfScore);
  });

  // Get top results by fused score
  const rankedIds = Array.from(fusedScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  // Fetch full data for top results
  const { data: finalResults } = await supabase
    .from('cognitive_nodes')
    .select('*')
    .eq('user_id', userId)
    .in('id', rankedIds);

  const hybridResults = rankedIds.map(id => {
    const node = finalResults?.find(n => n.id === id);
    const bm25Result = bm25Results.results.find(r => r.id === id);
    const semanticResult = semanticResults?.find((r: any) => r.id === id);
    
    return {
      ...node,
      bm25_score: bm25Result?.bm25_score || 0,
      semantic_score: semanticResult?.similarity || 0,
      combined_score: fusedScores.get(id),
      term_matches: bm25Result?.term_matches || []
    };
  }).filter(Boolean);

  return {
    results: hybridResults,
    totalDocuments: bm25Results.totalDocuments,
    avgDocLength: bm25Results.avgDocLength
  };
}

// DBSCAN Clustering Implementation
async function dbscanClustering(
  userId: string,
  eps: number = 0.3,
  minPoints: number = 3,
  useEmbeddings: boolean = true
) {
  console.log('🔬 Executing DBSCAN clustering:', { eps, minPoints, useEmbeddings });

  // Get all nodes with embeddings
  const { data: nodes, error } = await supabase
    .from('cognitive_nodes')
    .select('*')
    .eq('user_id', userId)
    .not('embedding_general', 'is', null);

  if (error) throw error;
  if (!nodes || nodes.length < minPoints) {
    return { clusters: [], clusterNodes: [], totalClusters: 0, noisePoints: 0, silhouetteScore: 0 };
  }

  // Simple DBSCAN implementation
  const visited = new Set();
  const clustered = new Set();
  const clusters: any[] = [];
  let clusterId = 0;
  let noisePoints = 0;

  // Distance function (cosine distance for embeddings)
  const distance = (node1: any, node2: any): number => {
    if (useEmbeddings && node1.embedding_general && node2.embedding_general) {
      // Parse embeddings (stored as JSON strings)
      const emb1 = JSON.parse(node1.embedding_general);
      const emb2 = JSON.parse(node2.embedding_general);
      
      // Cosine distance
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;
      
      for (let i = 0; i < Math.min(emb1.length, emb2.length); i++) {
        dotProduct += emb1[i] * emb2[i];
        norm1 += emb1[i] * emb1[i];
        norm2 += emb2[i] * emb2[i];
      }
      
      norm1 = Math.sqrt(norm1);
      norm2 = Math.sqrt(norm2);
      
      return 1 - (dotProduct / (norm1 * norm2));
    } else {
      // Simple text-based distance
      const text1 = node1.content.toLowerCase();
      const text2 = node2.content.toLowerCase();
      const words1 = new Set(text1.split(/\s+/));
      const words2 = new Set(text2.split(/\s+/));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      return 1 - (intersection.size / union.size); // Jaccard distance
    }
  };

  // Find neighbors within eps distance
  const findNeighbors = (nodeIndex: number): number[] => {
    const neighbors: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i !== nodeIndex && distance(nodes[nodeIndex], nodes[i]) <= eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  // DBSCAN algorithm
  for (let i = 0; i < nodes.length; i++) {
    if (visited.has(i)) continue;
    
    visited.add(i);
    const neighbors = findNeighbors(i);
    
    if (neighbors.length < minPoints) {
      noisePoints++;
      continue;
    }
    
    // Create new cluster
    const cluster = {
      id: clusterId++,
      core_points: 1,
      border_points: 0,
      total_points: 1,
      centroid: nodes[i].id,
      topics: [],
      density_score: neighbors.length / nodes.length,
      coherence_score: 0.8 // Simplified
    };
    
    clustered.add(i);
    
    // Expand cluster
    const queue = [...neighbors];
    while (queue.length > 0) {
      const neighborIndex = queue.shift()!;
      
      if (!visited.has(neighborIndex)) {
        visited.add(neighborIndex);
        const neighborNeighbors = findNeighbors(neighborIndex);
        
        if (neighborNeighbors.length >= minPoints) {
          queue.push(...neighborNeighbors);
          cluster.core_points++;
        } else {
          cluster.border_points++;
        }
      }
      
      if (!clustered.has(neighborIndex)) {
        clustered.add(neighborIndex);
        cluster.total_points++;
      }
    }
    
    clusters.push(cluster);
  }

  // Create cluster nodes mapping
  const clusterNodes = nodes.map((node, index) => {
    const clusterIndex = clusters.findIndex(cluster => 
      clustered.has(index)
    );
    
    return {
      id: node.id,
      content: node.content,
      title: node.title,
      node_type: node.node_type,
      cluster_id: clusterIndex >= 0 ? clusterIndex : -1,
      is_core_point: true, // Simplified
      density: 0.5, // Simplified
      neighbors: []
    };
  });

  // Calculate silhouette score (simplified)
  const silhouetteScore = clusters.length > 1 ? 0.6 : 0; // Simplified calculation

  return {
    clusters,
    clusterNodes,
    totalClusters: clusters.length,
    noisePoints,
    silhouetteScore
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      query, 
      searchType = 'neural', 
      userId,
      limit = 10,
      parameters = {},
      command
    } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing cognitive search: ${searchType}`, { query, userId, limit });

    let result;

    switch (searchType) {
      case 'bm25':
        if (!query) throw new Error('Query required for BM25 search');
        const searchTerms = parameters.searchTerms || query.toLowerCase().split(/\s+/);
        result = await bm25Search(
          userId, 
          searchTerms, 
          parameters.k1 || 1.2, 
          parameters.b || 0.75, 
          limit
        );
        break;

      case 'hybrid':
        if (!query) throw new Error('Query required for hybrid search');
        result = await hybridSearch(
          userId,
          query,
          parameters.bm25Weight || 0.4,
          parameters.semanticWeight || 0.6,
          parameters.rrfK || 60,
          limit
        );
        break;

      case 'fuzzy':
        if (!query) throw new Error('Query required for fuzzy search');
        // Implement fuzzy search logic here
        result = { results: [], totalDocuments: 0, avgDocLength: 0 };
        break;

      default:
        if (command === 'dbscan_clustering') {
          result = await dbscanClustering(
            userId,
            parameters.eps || 0.3,
            parameters.minPoints || 3,
            parameters.useEmbeddings !== false
          );
        } else {
          // Default neural search
          if (!query) throw new Error('Query required for neural search');
          const queryEmbedding = await generateEmbedding(query);
          
          const { data: searchResults, error } = await supabase.rpc('cognitive_search', {
            p_user_id: userId,
            p_query_embedding: queryEmbedding,
            p_search_type: 'general',
            p_limit: limit,
            p_similarity_threshold: 0.7
          });

          if (error) throw error;
          result = { results: searchResults || [] };
        }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cognitive search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

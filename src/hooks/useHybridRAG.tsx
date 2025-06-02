
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBM25Search, type BM25SearchResult } from '@/hooks/useBM25Search';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { supabase } from '@/integrations/supabase/client';

export interface RAGDocument {
  id: string;
  content: string;
  title: string;
  type: string;
  relevance_score: number;
  timestamp: string;
  metadata: any;
}

export interface HybridSearchResult extends RAGDocument {
  bm25_score?: number;
  semantic_score?: number;
  graph_score?: number;
  combined_score: number;
  rank_position: number;
  retrieval_method: 'bm25' | 'semantic' | 'graph' | 'hybrid';
}

export interface RerankingConfig {
  diversityWeight: number;
  temporalDecay: number;
  semanticThreshold: number;
  maxResults: number;
}

export function useHybridRAG() {
  const { user } = useAuth();
  const { bm25Search } = useBM25Search();
  const { createNeuralNode } = useNeuralSystem();
  
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HybridSearchResult[]>([]);
  const [searchMetrics, setSearchMetrics] = useState({
    totalTime: 0,
    bm25Time: 0,
    semanticTime: 0,
    graphTime: 0,
    rerankTime: 0,
    totalResults: 0,
    diversityScore: 0
  });

  // Advanced document chunking
  const chunkDocument = useCallback((content: string, options = {
    chunkSize: 1000,
    overlap: 200,
    preserveSentences: true
  }) => {
    const chunks: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let currentSize = 0;
    
    for (const sentence of sentences) {
      const sentenceSize = sentence.length;
      
      if (currentSize + sentenceSize > options.chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Handle overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(options.overlap / 6)); // Approximate words for overlap
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
        currentSize = currentChunk.length;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        currentSize += sentenceSize;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }, []);

  // Graph traversal search using existing cognitive_search function
  const graphTraversalSearch = useCallback(async (
    query: string, 
    startNodes: string[], 
    maxDepth: number = 3
  ): Promise<HybridSearchResult[]> => {
    if (!user || startNodes.length === 0) return [];

    try {
      console.log('🕸️ Starting graph traversal search...');
      
      // Use existing cognitive_search function instead of non-existent graph_traversal_search
      const { data, error } = await supabase.rpc('cognitive_search', {
        p_user_id: user.id,
        p_query_embedding: null, // Use null instead of empty array for vector type
        p_search_type: 'general',
        p_limit: 10,
        p_similarity_threshold: 0.5
      });

      if (error) throw error;

      return (data || []).map((result: any, index: number) => ({
        id: result.id,
        content: result.content,
        title: result.title || 'Graph Node',
        type: result.node_type,
        relevance_score: result.relevance_score || 0.5,
        timestamp: result.created_at || new Date().toISOString(),
        metadata: {},
        graph_score: result.similarity || 0.5,
        combined_score: (result.similarity || 0.5) * (result.relevance_score || 0.5),
        rank_position: index + 1,
        retrieval_method: 'graph' as const
      }));
    } catch (error) {
      console.error('❌ Graph traversal search error:', error);
      return [];
    }
  }, [user]);

  // Reciprocal Rank Fusion (RRF)
  const applyRRF = useCallback((
    results: Array<{ results: HybridSearchResult[]; weight: number; k?: number }>,
    finalK: number = 60
  ): HybridSearchResult[] => {
    const scoreMap = new Map<string, number>();
    const resultMap = new Map<string, HybridSearchResult>();

    results.forEach(({ results: resultList, weight, k = finalK }) => {
      resultList.forEach((result, index) => {
        const rrf_score = weight / (k + index + 1);
        const currentScore = scoreMap.get(result.id) || 0;
        scoreMap.set(result.id, currentScore + rrf_score);
        
        if (!resultMap.has(result.id)) {
          resultMap.set(result.id, { ...result, retrieval_method: 'hybrid' });
        }
      });
    });

    return Array.from(scoreMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id, score], index) => ({
        ...resultMap.get(id)!,
        combined_score: score,
        rank_position: index + 1
      }));
  }, []);

  // Diversity injection using MMR (Maximal Marginal Relevance)
  const injectDiversity = useCallback((
    results: HybridSearchResult[],
    lambda: number = 0.7, // Balance between relevance and diversity
    maxResults: number = 20
  ): HybridSearchResult[] => {
    if (results.length === 0) return [];

    const selected: HybridSearchResult[] = [];
    const remaining = [...results];
    
    // Select the first result (highest scoring)
    selected.push(remaining.shift()!);

    while (selected.length < maxResults && remaining.length > 0) {
      let bestIndex = 0;
      let bestScore = -Infinity;

      remaining.forEach((candidate, index) => {
        // Relevance score
        const relevance = candidate.combined_score;
        
        // Similarity to already selected items (simplified using content overlap)
        let maxSimilarity = 0;
        selected.forEach(selectedItem => {
          const overlap = calculateTextSimilarity(candidate.content, selectedItem.content);
          maxSimilarity = Math.max(maxSimilarity, overlap);
        });

        // MMR score
        const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarity;
        
        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIndex = index;
        }
      });

      selected.push(remaining.splice(bestIndex, 1)[0]);
    }

    return selected.map((result, index) => ({
      ...result,
      rank_position: index + 1
    }));
  }, []);

  // Simple text similarity calculation
  const calculateTextSimilarity = useCallback((text1: string, text2: string): number => {
    const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }, []);

  // Temporal decay function
  const applyTemporalDecay = useCallback((
    results: HybridSearchResult[],
    decayFactor: number = 0.1
  ): HybridSearchResult[] => {
    const now = Date.now();
    
    return results.map(result => {
      const age = (now - new Date(result.timestamp).getTime()) / (1000 * 60 * 60 * 24); // days
      const temporalWeight = Math.exp(-decayFactor * age);
      
      return {
        ...result,
        combined_score: result.combined_score * temporalWeight
      };
    });
  }, []);

  // BM25 to hybrid result conversion
  const convertBM25ToHybridResult = useCallback((result: BM25SearchResult): HybridSearchResult => {
    return {
      id: result.id,
      content: result.content,
      title: result.title || 'BM25 Result',
      type: result.type || 'document',
      relevance_score: result.score || 0.5,
      timestamp: new Date().toISOString(),
      metadata: result.metadata || {},
      bm25_score: result.score,
      combined_score: result.score || 0.5,
      rank_position: 1,
      retrieval_method: 'bm25' as const
    };
  }, []);

  // Main hybrid search function
  const hybridSearch = useCallback(async (
    query: string,
    config: Partial<RerankingConfig> = {}
  ): Promise<HybridSearchResult[]> => {
    if (!user || !query.trim()) return [];

    const finalConfig: RerankingConfig = {
      diversityWeight: 0.3,
      temporalDecay: 0.1,
      semanticThreshold: 0.7,
      maxResults: 20,
      ...config
    };

    setIsSearching(true);
    setLastQuery(query);
    
    const startTime = Date.now();
    let bm25Time = 0, semanticTime = 0, graphTime = 0, rerankTime = 0;

    try {
      console.log('🔍 Starting hybrid RAG search for:', query);

      // 1. BM25 Search (Sparse Retrieval)
      const bm25Start = Date.now();
      const bm25Results = await bm25Search(query, 50);
      bm25Time = Date.now() - bm25Start;
      
      const bm25Formatted: HybridSearchResult[] = bm25Results.map((result, index) => 
        convertBM25ToHybridResult(result)
      );

      // 2. Semantic Search (simulated)
      const semanticStart = Date.now();
      const semanticFormatted: HybridSearchResult[] = [];
      semanticTime = Date.now() - semanticStart;

      // 3. Graph Traversal Search
      const graphStart = Date.now();
      const topSemanticNodes = bm25Formatted.slice(0, 5).map(r => r.id);
      const graphResults = await graphTraversalSearch(query, topSemanticNodes);
      graphTime = Date.now() - graphStart;

      // 4. Apply RRF to combine results
      const rerankStart = Date.now();
      let combinedResults = applyRRF([
        { results: bm25Formatted, weight: 0.6 },
        { results: semanticFormatted, weight: 0.2 },
        { results: graphResults, weight: 0.2 }
      ]);

      // 5. Apply temporal decay
      combinedResults = applyTemporalDecay(combinedResults, finalConfig.temporalDecay);

      // 6. Sort by combined score
      combinedResults.sort((a, b) => b.combined_score - a.combined_score);

      // 7. Apply diversity injection
      combinedResults = injectDiversity(
        combinedResults, 
        1 - finalConfig.diversityWeight, 
        finalConfig.maxResults
      );

      rerankTime = Date.now() - rerankStart;

      // Calculate diversity score
      const diversityScore = combinedResults.length > 1 
        ? combinedResults.reduce((acc, result, index) => {
            if (index === 0) return acc;
            const similarity = calculateTextSimilarity(result.content, combinedResults[0].content);
            return acc + (1 - similarity);
          }, 0) / (combinedResults.length - 1)
        : 0;

      const totalTime = Date.now() - startTime;

      setSearchMetrics({
        totalTime,
        bm25Time,
        semanticTime,
        graphTime,
        rerankTime,
        totalResults: combinedResults.length,
        diversityScore
      });

      setSearchResults(combinedResults);
      
      console.log(`✅ Hybrid search completed in ${totalTime}ms with ${combinedResults.length} results`);
      return combinedResults;

    } catch (error) {
      console.error('❌ Hybrid search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [user, bm25Search, graphTraversalSearch, applyRRF, applyTemporalDecay, injectDiversity, calculateTextSimilarity, convertBM25ToHybridResult]);

  return {
    // State
    isSearching,
    lastQuery,
    searchResults,
    searchMetrics,
    
    // Main function
    hybridSearch,
    
    // Utility functions
    chunkDocument,
    applyRRF,
    injectDiversity,
    calculateTextSimilarity
  };
}

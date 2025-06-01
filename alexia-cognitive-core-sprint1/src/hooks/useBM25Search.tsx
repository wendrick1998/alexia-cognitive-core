
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface BM25Result {
  id: string;
  content: string;
  title?: string;
  node_type: string;
  bm25_score: number;
  combined_score: number;
  relevance_score: number;
  term_matches: string[];
}

export interface SearchMetrics {
  total_documents: number;
  avg_doc_length: number;
  query_terms: string[];
  execution_time: number;
}

export function useBM25Search() {
  const { user } = useAuth();
  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // BM25 search with full-text capabilities
  const bm25Search = useCallback(async (
    query: string,
    limit: number = 10,
    k1: number = 1.2,
    b: number = 0.75,
    minScore: number = 0.1
  ): Promise<BM25Result[]> => {
    if (!user || !query.trim()) return [];

    setIsSearching(true);
    const startTime = Date.now();

    try {
      console.log('🔍 BM25 Search:', { query, k1, b, minScore });

      // Prepare search terms
      const searchTerms = query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(term => term.length > 2);

      if (searchTerms.length === 0) return [];

      // Execute hybrid search using the edge function
      const { data, error } = await supabase.functions.invoke('cognitive-search', {
        body: {
          query,
          searchType: 'bm25',
          userId: user.id,
          limit,
          parameters: {
            k1,
            b,
            minScore,
            searchTerms
          }
        }
      });

      if (error) throw error;

      const results: BM25Result[] = data.results || [];
      const executionTime = Date.now() - startTime;

      // Set search metrics
      setSearchMetrics({
        total_documents: data.totalDocuments || 0,
        avg_doc_length: data.avgDocLength || 0,
        query_terms: searchTerms,
        execution_time: executionTime
      });

      console.log(`✅ BM25 search completed: ${results.length} results in ${executionTime}ms`);
      return results;

    } catch (error) {
      console.error('❌ BM25 search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Hybrid search combining BM25 with semantic similarity
  const hybridSearch = useCallback(async (
    query: string,
    limit: number = 10,
    bm25Weight: number = 0.4,
    semanticWeight: number = 0.6
  ): Promise<BM25Result[]> => {
    if (!user || !query.trim()) return [];

    setIsSearching(true);
    const startTime = Date.now();

    try {
      console.log('🔍 Hybrid Search:', { query, bm25Weight, semanticWeight });

      // Execute hybrid search
      const { data, error } = await supabase.functions.invoke('cognitive-search', {
        body: {
          query,
          searchType: 'hybrid',
          userId: user.id,
          limit,
          parameters: {
            bm25Weight,
            semanticWeight,
            rrfK: 60 // Reciprocal Rank Fusion parameter
          }
        }
      });

      if (error) throw error;

      const results: BM25Result[] = data.results || [];
      const executionTime = Date.now() - startTime;

      setSearchMetrics({
        total_documents: data.totalDocuments || 0,
        avg_doc_length: data.avgDocLength || 0,
        query_terms: query.split(/\s+/),
        execution_time: executionTime
      });

      console.log(`✅ Hybrid search completed: ${results.length} results in ${executionTime}ms`);
      return results;

    } catch (error) {
      console.error('❌ Hybrid search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Fuzzy search for handling typos and variations
  const fuzzySearch = useCallback(async (
    query: string,
    limit: number = 10,
    maxDistance: number = 2
  ): Promise<BM25Result[]> => {
    if (!user || !query.trim()) return [];

    setIsSearching(true);
    const startTime = Date.now();

    try {
      console.log('🔍 Fuzzy Search:', { query, maxDistance });

      const { data, error } = await supabase.functions.invoke('cognitive-search', {
        body: {
          query,
          searchType: 'fuzzy',
          userId: user.id,
          limit,
          parameters: {
            maxDistance,
            threshold: 0.6
          }
        }
      });

      if (error) throw error;

      const results: BM25Result[] = data.results || [];
      const executionTime = Date.now() - startTime;

      setSearchMetrics({
        total_documents: data.totalDocuments || 0,
        avg_doc_length: data.avgDocLength || 0,
        query_terms: [query],
        execution_time: executionTime
      });

      console.log(`✅ Fuzzy search completed: ${results.length} results in ${executionTime}ms`);
      return results;

    } catch (error) {
      console.error('❌ Fuzzy search error:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Get search suggestions
  const getSearchSuggestions = useCallback(async (
    partialQuery: string,
    limit: number = 5
  ): Promise<string[]> => {
    if (!user || partialQuery.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('content, title')
        .eq('user_id', user.id)
        .textSearch('content', partialQuery, {
          type: 'websearch',
          config: 'portuguese'
        })
        .limit(limit);

      if (error) throw error;

      // Extract unique terms for suggestions
      const suggestions = new Set<string>();
      
      (data || []).forEach(node => {
        const text = `${node.title || ''} ${node.content}`.toLowerCase();
        const words = text.split(/\s+/);
        
        words.forEach(word => {
          if (word.startsWith(partialQuery.toLowerCase()) && word.length > partialQuery.length) {
            suggestions.add(word);
          }
        });
      });

      return Array.from(suggestions).slice(0, limit);

    } catch (error) {
      console.error('❌ Error getting search suggestions:', error);
      return [];
    }
  }, [user]);

  return {
    // Search functions
    bm25Search,
    hybridSearch,
    fuzzySearch,
    getSearchSuggestions,
    
    // State
    searchMetrics,
    isSearching
  };
}

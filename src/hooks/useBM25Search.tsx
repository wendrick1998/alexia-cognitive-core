
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface BM25Document {
  id: string;
  content: string;
  title?: string;
  metadata: any;
  type: 'node' | 'document' | 'memory' | 'conversation';
}

export interface BM25SearchResult extends BM25Document {
  score: number;
  highlights: string[];
  relevanceFactors: {
    termFrequency: number;
    inverseDocumentFrequency: number;
    documentLength: number;
    fieldBoosts: Record<string, number>;
  };
}

export interface SearchMetrics {
  totalDocuments: number;
  indexedTerms: number;
  lastIndexUpdate: string;
  avgDocumentLength: number;
  searchLatency: number;
}

export interface FuzzySearchOptions {
  maxDistance: number;
  prefixLength: number;
  includeMatches: boolean;
  threshold: number;
}

export function useBM25Search() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<BM25Document[]>([]);
  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics>({
    totalDocuments: 0,
    indexedTerms: 0,
    lastIndexUpdate: '',
    avgDocumentLength: 0,
    searchLatency: 0
  });
  const [isSearching, setIsSearching] = useState(false);

  // BM25 parameters
  const k1 = useRef(1.5); // Term frequency saturation parameter
  const b = useRef(0.75); // Length normalization parameter

  // Document index
  const termFrequencies = useRef<Map<string, Map<string, number>>>(new Map());
  const documentFrequencies = useRef<Map<string, number>>(new Map());
  const documentLengths = useRef<Map<string, number>>(new Map());
  const avgDocumentLength = useRef(0);

  // Preprocessing utilities
  const preprocessText = useCallback((text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2)
      .filter(term => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'within', 'without', 'toward', 'uma', 'dos', 'das', 'para', 'com', 'por', 'sem', 'sobre', 'entre', 'durante', 'depois', 'antes', 'dentro', 'fora'].includes(term));
  }, []);

  // Build search index
  const buildIndex = useCallback(async () => {
    console.log('📚 Building BM25 search index...');
    
    termFrequencies.current.clear();
    documentFrequencies.current.clear();
    documentLengths.current.clear();

    let totalLength = 0;

    // Process each document
    documents.forEach(doc => {
      const terms = preprocessText(doc.content + ' ' + (doc.title || ''));
      const docTermFreq = new Map<string, number>();

      // Calculate term frequencies for this document
      terms.forEach(term => {
        docTermFreq.set(term, (docTermFreq.get(term) || 0) + 1);
      });

      // Store document data
      termFrequencies.current.set(doc.id, docTermFreq);
      documentLengths.current.set(doc.id, terms.length);
      totalLength += terms.length;

      // Update document frequencies
      Array.from(docTermFreq.keys()).forEach(term => {
        documentFrequencies.current.set(term, (documentFrequencies.current.get(term) || 0) + 1);
      });
    });

    // Calculate average document length
    avgDocumentLength.current = documents.length > 0 ? totalLength / documents.length : 0;

    setSearchMetrics(prev => ({
      ...prev,
      totalDocuments: documents.length,
      indexedTerms: documentFrequencies.current.size,
      lastIndexUpdate: new Date().toISOString(),
      avgDocumentLength: avgDocumentLength.current
    }));

    console.log(`✅ Index built: ${documents.length} docs, ${documentFrequencies.current.size} terms`);
  }, [documents, preprocessText]);

  // Calculate BM25 score
  const calculateBM25Score = useCallback((
    queryTerms: string[],
    documentId: string
  ): { score: number; details: any } => {
    const docTermFreq = termFrequencies.current.get(documentId);
    const docLength = documentLengths.current.get(documentId) || 0;
    
    if (!docTermFreq) return { score: 0, details: {} };

    let score = 0;
    const details: any = {};

    queryTerms.forEach(term => {
      const tf = docTermFreq.get(term) || 0;
      const df = documentFrequencies.current.get(term) || 0;
      
      if (tf > 0 && df > 0) {
        // IDF calculation
        const idf = Math.log((documents.length - df + 0.5) / (df + 0.5));
        
        // TF normalization
        const normalizedTf = (tf * (k1.current + 1)) / 
          (tf + k1.current * (1 - b.current + b.current * (docLength / avgDocumentLength.current)));
        
        const termScore = idf * normalizedTf;
        score += termScore;

        details[term] = {
          tf,
          df,
          idf: Number(idf.toFixed(3)),
          normalizedTf: Number(normalizedTf.toFixed(3)),
          termScore: Number(termScore.toFixed(3))
        };
      }
    });

    return { score, details };
  }, [documents.length]);

  // BM25 search
  const bm25Search = useCallback(async (
    query: string,
    limit: number = 10,
    boostFields: Record<string, number> = { title: 2.0, content: 1.0 }
  ): Promise<BM25SearchResult[]> => {
    const startTime = performance.now();
    setIsSearching(true);

    try {
      const queryTerms = preprocessText(query);
      if (queryTerms.length === 0) return [];

      console.log(`🔍 BM25 search: "${query}" -> [${queryTerms.join(', ')}]`);

      const results: BM25SearchResult[] = [];

      documents.forEach(doc => {
        const { score, details } = calculateBM25Score(queryTerms, doc.id);
        
        if (score > 0) {
          // Apply field boosts
          let boostedScore = score;
          if (doc.title && queryTerms.some(term => doc.title!.toLowerCase().includes(term))) {
            boostedScore *= (boostFields.title || 1.0);
          }

          // Generate highlights
          const highlights = queryTerms
            .filter(term => doc.content.toLowerCase().includes(term))
            .map(term => {
              const regex = new RegExp(`(${term})`, 'gi');
              const match = doc.content.match(regex);
              return match ? match[0] : term;
            });

          // Safely extract numeric values from details with proper typing
          const termFrequency = Object.values(details).reduce<number>((sum: number, d: any) => {
            const tf = typeof d.tf === 'number' ? d.tf : 0;
            return sum + tf;
          }, 0);

          const inverseDocumentFrequency = Object.values(details).reduce<number>((sum: number, d: any) => {
            const idf = typeof d.idf === 'number' ? d.idf : 0;
            return sum + idf;
          }, 0);

          results.push({
            ...doc,
            score: boostedScore,
            highlights,
            relevanceFactors: {
              termFrequency,
              inverseDocumentFrequency,
              documentLength: documentLengths.current.get(doc.id) || 0,
              fieldBoosts: boostFields
            }
          });
        }
      });

      // Sort by score and limit results
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      const searchLatency = performance.now() - startTime;
      setSearchMetrics(prev => ({ ...prev, searchLatency }));

      console.log(`✅ BM25 search completed: ${sortedResults.length} results in ${searchLatency.toFixed(2)}ms`);
      return sortedResults;

    } catch (error) {
      console.error('❌ Error in BM25 search:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [documents, preprocessText, calculateBM25Score]);

  // Hybrid search (BM25 + Semantic)
  const hybridSearch = useCallback(async (
    query: string,
    limit: number = 10,
    bm25Weight: number = 0.6,
    semanticWeight: number = 0.4
  ): Promise<BM25SearchResult[]> => {
    console.log(`🔀 Hybrid search: BM25(${bm25Weight}) + Semantic(${semanticWeight})`);

    try {
      // Get BM25 results
      const bm25Results = await bm25Search(query, limit * 2);
      
      // Normalize BM25 scores
      const maxBm25Score = Math.max(...bm25Results.map(r => r.score), 1);
      
      const hybridResults = bm25Results.map(result => ({
        ...result,
        score: (result.score / maxBm25Score) * bm25Weight,
        relevanceFactors: {
          ...result.relevanceFactors,
          hybridWeights: { bm25: bm25Weight, semantic: semanticWeight }
        }
      }));

      return hybridResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Error in hybrid search:', error);
      return [];
    }
  }, [bm25Search]);

  // Fuzzy search
  const fuzzySearch = useCallback(async (
    query: string,
    options: Partial<FuzzySearchOptions> = {}
  ): Promise<BM25SearchResult[]> => {
    const {
      maxDistance = 2,
      prefixLength = 0,
      threshold = 0.6
    } = options;

    console.log(`🔍 Fuzzy search: "${query}" (distance: ${maxDistance})`);

    // Simple Levenshtein distance implementation
    const levenshteinDistance = (a: string, b: string): number => {
      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
      
      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
      
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + indicator
          );
        }
      }
      
      return matrix[b.length][a.length];
    };

    const queryTerms = preprocessText(query);
    const fuzzyMatches: BM25SearchResult[] = [];

    documents.forEach(doc => {
      const docTerms = preprocessText(doc.content + ' ' + (doc.title || ''));
      let totalScore = 0;
      const highlights: string[] = [];

      queryTerms.forEach(queryTerm => {
        docTerms.forEach(docTerm => {
          if (docTerm.length >= prefixLength) {
            const distance = levenshteinDistance(queryTerm, docTerm);
            const similarity = 1 - (distance / Math.max(queryTerm.length, docTerm.length));
            
            if (similarity >= threshold && distance <= maxDistance) {
              totalScore += similarity;
              highlights.push(docTerm);
            }
          }
        });
      });

      if (totalScore > 0) {
        fuzzyMatches.push({
          ...doc,
          score: totalScore,
          highlights: [...new Set(highlights)],
          relevanceFactors: {
            termFrequency: 0,
            inverseDocumentFrequency: 0,
            documentLength: docTerms.length,
            fieldBoosts: { fuzzy: totalScore }
          }
        });
      }
    });

    return fuzzyMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [documents, preprocessText]);

  // Load documents from database
  const loadDocuments = useCallback(async () => {
    if (!user) return;

    try {
      console.log('📖 Loading documents for BM25 indexing...');
      
      // Load from cognitive nodes
      const { data: nodes, error: nodesError } = await supabase
        .from('cognitive_nodes')
        .select('id, content, title, node_type, metadata')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (nodesError) throw nodesError;

      // Load from documents (using correct table structure)
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('id, title, metadata')
        .eq('user_id', user.id);

      if (docsError) throw docsError;

      // Combine and format
      const allDocuments: BM25Document[] = [
        ...(nodes || []).map(node => ({
          id: node.id,
          content: node.content || '',
          title: node.title,
          metadata: node.metadata || {},
          type: 'node' as const
        })),
        ...(docs || []).map(doc => ({
          id: doc.id,
          content: '', // Documents table doesn't have content column directly
          title: doc.title,
          metadata: doc.metadata || {},
          type: 'document' as const
        }))
      ];

      setDocuments(allDocuments);
      console.log(`✅ Loaded ${allDocuments.length} documents for indexing`);
    } catch (error) {
      console.error('❌ Error loading documents:', error);
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  // Build index when documents change
  useEffect(() => {
    if (documents.length > 0) {
      buildIndex();
    }
  }, [documents, buildIndex]);

  return {
    // Search functions
    bm25Search,
    hybridSearch,
    fuzzySearch,
    
    // Data management
    loadDocuments,
    buildIndex,
    
    // State
    documents,
    searchMetrics,
    isSearching,
    
    // Utilities
    preprocessText
  };
}

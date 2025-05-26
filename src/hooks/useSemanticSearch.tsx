
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  content: string;
  document_name: string;
  chunk_index: number;
  similarity_score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results: number;
  fallback?: boolean;
  message?: string;
}

export function useSemanticSearch() {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [lastQuery, setLastQuery] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  const searchDocuments = async (
    queryText: string, 
    projectId?: string, 
    topN: number = 5
  ): Promise<SearchResult[]> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer buscas",
        variant: "destructive",
      });
      return [];
    }

    if (!queryText.trim()) {
      toast({
        title: "Query vazia",
        description: "Digite algo para buscar",
        variant: "destructive",
      });
      return [];
    }

    try {
      setSearching(true);
      setLastQuery(queryText);

      console.log(`Starting semantic search for: "${queryText}"`);

      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { 
          query_text: queryText.trim(),
          user_id: user.id,
          project_id: projectId,
          top_n: topN
        }
      });

      if (error) {
        console.error('Error calling semantic-search function:', error);
        toast({
          title: "Erro na busca",
          description: `Falha ao buscar documentos: ${error.message}`,
          variant: "destructive",
        });
        return [];
      }

      const searchResponse = data as SearchResponse;
      console.log('Search response:', searchResponse);

      if (searchResponse.fallback) {
        toast({
          title: "Busca com funcionalidade limitada",
          description: searchResponse.message || "Usando busca básica",
          variant: "default",
        });
      }

      const searchResults = searchResponse.results || [];
      setResults(searchResults);

      toast({
        title: "Busca concluída",
        description: `Encontrados ${searchResults.length} resultados para "${queryText}"`,
      });

      return searchResults;
    } catch (error) {
      console.error('Error in searchDocuments:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro inesperado ao buscar documentos",
        variant: "destructive",
      });
      return [];
    } finally {
      setSearching(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setLastQuery('');
  };

  return {
    searching,
    results,
    lastQuery,
    searchDocuments,
    clearResults,
  };
}

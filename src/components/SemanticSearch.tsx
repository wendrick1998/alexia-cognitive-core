
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { Search, Brain, FileText, MessageSquare, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const { results, searching, searchDocuments, clearResults } = useSemanticSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    // Clear previous results
    clearResults();
    
    // Search documents
    await searchDocuments(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'memory':
        return <Brain className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'conversation':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'memory':
        return 'Memória';
      case 'document':
        return 'Documento';
      case 'conversation':
        return 'Conversa';
      default:
        return 'Conteúdo';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'memory':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'document':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'conversation':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Convert SearchResult to display format
  const searchResults = results.map(result => ({
    title: result.document_name || 'Documento sem título',
    content: result.content,
    source: 'document' as const,
    category: 'Documento',
    created_at: new Date().toISOString(), // Placeholder since SearchResult doesn't have created_at
    similarity: result.similarity_score,
    url: undefined
  }));

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Busca Semântica</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Encontre qualquer informação em seus documentos
            </p>
          </div>
        </div>
        
        {/* Search input */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="O que você está procurando?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              disabled={searching}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || searching}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results with scroll */}
      <ScrollArea className="flex-1 p-6">
        {!searchResults || searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {query ? 'Nenhum resultado encontrado' : 'Digite sua pesquisa'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {query 
                ? 'Tente usar termos diferentes ou mais gerais.'
                : 'Use a busca semântica para encontrar informações em seus documentos.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Resultados da busca
              </h2>
              <Badge variant="secondary" className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {searchResults.map((result, index) => (
                <Card key={index} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {result.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getSourceColor(result.source)}>
                            {getSourceIcon(result.source)}
                            <span className="ml-1">{getSourceLabel(result.source)}</span>
                          </Badge>
                          {result.category && (
                            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                              {result.category}
                            </Badge>
                          )}
                          {result.created_at && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(result.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          )}
                        </div>
                      </div>
                      {result.similarity && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {Math.round(result.similarity * 100)}% relevante
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {result.content}
                    </CardDescription>
                    
                    {result.url && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600"
                        >
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Ver original
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SemanticSearch;

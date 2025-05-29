
import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Clock, FileText, MessageCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchResult {
  id: string;
  type: 'conversation' | 'memory' | 'document';
  title: string;
  content: string;
  relevance: number;
  date: string;
  metadata?: {
    messageCount?: number;
    size?: string;
    tags?: string[];
  };
}

interface SemanticSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

const SemanticSearch = ({ onResultSelect, className }: SemanticSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'projeto react',
    'configuração typescript',
    'documentação API'
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'conversation',
      title: 'Discussão sobre React e TypeScript',
      content: 'Conversamos sobre as melhores práticas para usar TypeScript com React...',
      relevance: 0.95,
      date: '2024-01-15',
      metadata: { messageCount: 12 }
    },
    {
      id: '2',
      type: 'memory',
      title: 'Preferência por frameworks',
      content: 'O usuário prefere React para projetos frontend e Express para backend...',
      relevance: 0.87,
      date: '2024-01-10',
      metadata: { tags: ['frontend', 'backend'] }
    },
    {
      id: '3',
      type: 'document',
      title: 'Documentação da API v2.0',
      content: 'Especificações completas da nova versão da API...',
      relevance: 0.72,
      date: '2024-01-08',
      metadata: { size: '2.3 MB' }
    }
  ];

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filteredResults);
      setLoading(false);
    }, 500);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
    
    // Add to recent searches
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageCircle className="w-4 h-4" />;
      case 'memory':
        return <Brain className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'text-blue-600 bg-blue-100';
      case 'memory':
        return 'text-purple-600 bg-purple-100';
      case 'document':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'Conversa';
      case 'memory':
        return 'Memória';
      case 'document':
        return 'Documento';
      default:
        return 'Item';
    }
  };

  useEffect(() => {
    if (query) {
      const debounce = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [query]);

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Busque em conversas, memórias e documentos..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10 py-3 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </Button>
        )}
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Buscas recentes</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(search)}
                className="text-xs rounded-full"
              >
                <Clock className="w-3 h-3 mr-1" />
                {search}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-4 p-6 text-center">
          <div className="inline-flex items-center gap-3 text-gray-600">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Buscando...</span>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => onResultSelect?.(result)}
              className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn('text-xs', getTypeColor(result.type))}>
                    {getTypeIcon(result.type)}
                    <span className="ml-1">{getTypeLabel(result.type)}</span>
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {Math.round(result.relevance * 100)}% relevante
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(result.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {result.title}
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {result.content}
              </p>
              
              {result.metadata && (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {result.metadata.messageCount && (
                    <span>{result.metadata.messageCount} mensagens</span>
                  )}
                  {result.metadata.size && (
                    <span>{result.metadata.size}</span>
                  )}
                  {result.metadata.tags && (
                    <div className="flex gap-1">
                      {result.metadata.tags.map((tag, index) => (
                        <span key={index} className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {query && results.length === 0 && !loading && (
        <div className="mt-8 text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Tente usar termos diferentes ou explore outras seções.
          </p>
          <Button onClick={clearSearch} variant="outline">
            Limpar busca
          </Button>
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;

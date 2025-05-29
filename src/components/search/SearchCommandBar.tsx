
import { useState, useEffect } from 'react';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { useBM25Search } from '@/hooks/useBM25Search';
import { useHybridRAG } from '@/hooks/useHybridRAG';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Mic, MessageCircle, FileText, Brain, Copy, Link, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchResultCard from './SearchResultCard';
import SearchFilters from './SearchFilters';
import VoiceSearch from './VoiceSearch';

interface SearchCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchCommandBar = ({ isOpen, onClose }: SearchCommandBarProps) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showVoice, setShowVoice] = useState(false);
  const [hoveredResult, setHoveredResult] = useState<string | null>(null);
  
  const { searching: semanticSearching, results: semanticResults, searchDocuments } = useSemanticSearch();
  const { isSearching: bm25Searching, bm25Search } = useBM25Search();
  const { isSearching: hybridSearching, searchResults: hybridResults, hybridSearch } = useHybridRAG();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // Parent component should handle opening
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    switch (activeFilter) {
      case 'semantic':
        await searchDocuments(searchQuery);
        break;
      case 'bm25':
        await bm25Search(searchQuery);
        break;
      case 'hybrid':
        await hybridSearch(searchQuery);
        break;
      default:
        // Run all searches for comprehensive results
        await Promise.all([
          searchDocuments(searchQuery),
          bm25Search(searchQuery),
          hybridSearch(searchQuery)
        ]);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      const debounceTimer = setTimeout(() => {
        handleSearch(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, activeFilter]);

  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);
    setShowVoice(false);
  };

  const allResults = [
    ...semanticResults.map(r => ({ ...r, type: 'semantic', source: 'Busca Semântica' })),
    ...hybridResults.map(r => ({ ...r, type: 'hybrid', source: 'Busca Híbrida' }))
  ];

  const isSearching = semanticSearching || bm25Searching || hybridSearching;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-screen items-start justify-center p-4 pt-20">
        <div className="w-full max-w-2xl">
          {/* Main Search Input */}
          <div className="bg-white rounded-xl shadow-2xl border">
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busque em seus documentos, conversas e memórias..."
                  className="pl-14 pr-20 h-16 text-xl border-none shadow-none focus:ring-0"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoice(true)}
                    className="w-8 h-8 p-0"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
              <SearchFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* Search Results */}
            {(query.trim() || allResults.length > 0) && (
              <>
                <Separator />
                <div className="max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Buscando...</span>
                    </div>
                  ) : allResults.length > 0 ? (
                    <div className="p-2">
                      {allResults.map((result, index) => (
                        <SearchResultCard
                          key={index}
                          result={result}
                          isHovered={hoveredResult === `${index}`}
                          onHover={() => setHoveredResult(`${index}`)}
                          onLeave={() => setHoveredResult(null)}
                          query={query}
                        />
                      ))}
                    </div>
                  ) : query.trim() && !isSearching ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum resultado encontrado
                      </h3>
                      <p className="text-gray-600">
                        Tente usar palavras-chave diferentes ou termos mais específicos
                      </p>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>

          {/* Search Tips */}
          {!query.trim() && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">K</kbd>
                  <span>para abrir</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd>
                  <span>para fechar</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Search Modal */}
      {showVoice && (
        <VoiceSearch
          isOpen={showVoice}
          onClose={() => setShowVoice(false)}
          onResult={handleVoiceResult}
        />
      )}
    </div>
  );
};

export default SearchCommandBar;

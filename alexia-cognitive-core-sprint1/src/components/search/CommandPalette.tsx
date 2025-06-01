import { useState, useEffect, useCallback, useRef } from 'react';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { useBM25Search } from '@/hooks/useBM25Search';
import { useHybridRAG } from '@/hooks/useHybridRAG';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, MessageCircle, Brain, FileText, Zap, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommandResult from './CommandResult';
import CommandPreview from './CommandPreview';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (section: string, id?: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'conversation' | 'memory' | 'document' | 'action';
  section: string;
  similarity?: number;
  timestamp?: string;
  preview?: string;
}

const CommandPalette = ({ isOpen, onClose, onNavigate }: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewResult, setPreviewResult] = useState<SearchResult | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { searchDocuments } = useSemanticSearch();
  const { bm25Search } = useBM25Search();
  const { hybridSearch } = useHybridRAG();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;
        case 'Tab':
          e.preventDefault();
          // Navigate between sections
          break;
      }

      // Number keys for quick select
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (results[index]) {
          e.preventDefault();
          handleSelectResult(results[index]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Check for special commands
      if (searchQuery.startsWith('>')) {
        // Command mode
        setResults(getCommandResults(searchQuery.slice(1)));
      } else if (searchQuery.startsWith('@')) {
        // Mention mode
        setResults(getMentionResults(searchQuery.slice(1)));
      } else if (searchQuery.startsWith('/')) {
        // Filter mode
        setResults(getFilterResults(searchQuery.slice(1)));
      } else if (searchQuery === '?') {
        // Help mode
        setResults(getHelpResults());
      } else {
        // Normal search
        const [semanticResults, hybridResults] = await Promise.all([
          searchDocuments(searchQuery, undefined, 5),
          hybridSearch(searchQuery, { maxResults: 5 })
        ]);

        const formattedResults: SearchResult[] = [
          ...semanticResults.map((r, i) => ({
            id: `semantic-${i}`,
            title: r.document_name || 'Documento',
            content: r.content,
            type: 'document' as const,
            section: 'Documentos',
            similarity: r.similarity_score,
            timestamp: 'Recente',
            preview: r.content.substring(0, 200) + '...'
          })),
          ...hybridResults.map((r, i) => ({
            id: `hybrid-${i}`,
            title: r.title || 'Resultado',
            content: r.content,
            type: r.type === 'conversation' ? 'conversation' as const : 'memory' as const,
            section: r.type === 'conversation' ? 'Conversas' : 'Memórias',
            similarity: r.combined_score || r.relevance_score,
            timestamp: 'Recente',
            preview: r.content.substring(0, 200) + '...'
          })),
          // Add quick actions
          ...getQuickActions(searchQuery)
        ];

        setResults(formattedResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchDocuments, hybridSearch]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);

  // Update preview when selection changes
  useEffect(() => {
    if (results[selectedIndex]) {
      setPreviewResult(results[selectedIndex]);
    }
  }, [selectedIndex, results]);

  const handleSelectResult = (result: SearchResult) => {
    console.log('Selected result:', result);
    
    switch (result.type) {
      case 'conversation':
        onNavigate?.('chat', result.id);
        break;
      case 'memory':
        onNavigate?.('memory', result.id);
        break;
      case 'document':
        onNavigate?.('documents', result.id);
        break;
      case 'action':
        // Execute action
        executeAction(result.id);
        break;
    }
    
    onClose();
  };

  const executeAction = (actionId: string) => {
    switch (actionId) {
      case 'new-conversation':
        onNavigate?.('chat');
        break;
      case 'dashboard':
        onNavigate?.('dashboard');
        break;
      case 'upload-document':
        onNavigate?.('documents');
        break;
      case 'create-memory':
        onNavigate?.('memory');
        break;
    }
  };

  const getQuickActions = (query: string): SearchResult[] => {
    const actions = [
      {
        id: 'new-conversation',
        title: 'Nova Conversa',
        content: 'Iniciar uma nova conversa com a IA',
        type: 'action' as const,
        section: 'Ações',
        similarity: 1,
        preview: 'Clique para iniciar uma nova conversa'
      },
      {
        id: 'dashboard',
        title: 'Abrir Dashboard',
        content: 'Visualizar painel de controle principal',
        type: 'action' as const,
        section: 'Ações',
        similarity: 1,
        preview: 'Acesse estatísticas e visão geral'
      }
    ];

    return actions.filter(action => 
      query === '' || 
      action.title.toLowerCase().includes(query.toLowerCase()) ||
      action.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getCommandResults = (command: string): SearchResult[] => {
    const commands = [
      {
        id: 'theme-dark',
        title: 'Tema Escuro',
        content: 'Alterar para tema escuro',
        type: 'action' as const,
        section: 'Comandos',
        similarity: 1
      },
      {
        id: 'theme-light',
        title: 'Tema Claro',
        content: 'Alterar para tema claro',
        type: 'action' as const,
        section: 'Comandos',
        similarity: 1
      }
    ];

    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(command.toLowerCase())
    );
  };

  const getMentionResults = (mention: string): SearchResult[] => {
    // Mock mentions
    return [];
  };

  const getFilterResults = (filter: string): SearchResult[] => {
    // Mock filters
    return [];
  };

  const getHelpResults = (): SearchResult[] => {
    return [
      {
        id: 'help-search',
        title: 'Busca Básica',
        content: 'Digite qualquer termo para buscar',
        type: 'action' as const,
        section: 'Ajuda',
        similarity: 1,
        preview: 'Busque em documentos, conversas e memórias'
      },
      {
        id: 'help-commands',
        title: 'Comandos',
        content: 'Use {">"} para comandos especiais',
        type: 'action' as const,
        section: 'Ajuda',
        similarity: 1,
        preview: 'Exemplo: {">"}theme dark'
      }
    ];
  };

  const getPlaceholder = () => {
    if (query.startsWith('>')) return 'Digite um comando...';
    if (query.startsWith('@')) return 'Mencionar pessoa...';
    if (query.startsWith('/')) return 'Filtrar resultados...';
    return 'Buscar em documentos, conversas e memórias...';
  };

  // Group results by section
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.section]) {
      acc[result.section] = [];
    }
    acc[result.section].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="flex min-h-screen items-start justify-center p-4 pt-20">
        <div 
          className="w-full max-w-2xl animate-scale-in"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4)'
          }}
        >
          {/* Search Input */}
          <div className="p-6 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/40" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={getPlaceholder()}
                className="pl-14 pr-12 h-16 text-xl bg-transparent border-none text-white placeholder:text-white/40 focus:ring-0 focus:outline-none"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 text-white/40 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Search hints */}
            <div className="flex gap-2 mt-4 text-sm text-white/40">
              <span>Use {"\">\""} para comandos</span>
              <span>•</span>
              <span>"@" para menções</span>
              <span>•</span>
              <span>"/" para filtros</span>
              <span>•</span>
              <span>"?" para ajuda</span>
            </div>
          </div>

          {/* Results */}
          <div className="flex">
            <div className="flex-1 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
                  <span className="ml-3 text-white/60">Buscando...</span>
                </div>
              ) : Object.keys(groupedResults).length > 0 ? (
                <div className="p-2">
                  {Object.entries(groupedResults).map(([section, sectionResults], sectionIndex) => (
                    <div key={section} className="mb-4 last:mb-0">
                      <div className="px-3 py-2 text-xs font-medium text-white/60 uppercase tracking-wide">
                        {section}
                      </div>
                      {sectionResults.map((result, index) => {
                        const globalIndex = Object.values(groupedResults)
                          .slice(0, sectionIndex)
                          .reduce((acc, arr) => acc + arr.length, 0) + index;
                        
                        return (
                          <CommandResult
                            key={result.id}
                            result={result}
                            isSelected={globalIndex === selectedIndex}
                            onClick={() => handleSelectResult(result)}
                            shortcut={globalIndex < 9 ? (globalIndex + 1).toString() : undefined}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : query.trim() && !isSearching ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-white/60">
                    Tente usar termos diferentes ou comandos especiais
                  </p>
                </div>
              ) : !query.trim() ? (
                <div className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="text-white/60">
                      <h3 className="font-medium mb-2">Busca Rápida</h3>
                      <p className="text-sm">Digite para buscar em documentos, conversas e memórias</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-white/40">
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">↑↓</kbd>
                        <span>Navegar</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40">
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⏎</kbd>
                        <span>Selecionar</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40">
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">1-9</kbd>
                        <span>Seleção rápida</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40">
                        <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>
                        <span>Fechar</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Preview Pane */}
            {previewResult && (
              <>
                <Separator orientation="vertical" className="bg-white/10" />
                <CommandPreview result={previewResult} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

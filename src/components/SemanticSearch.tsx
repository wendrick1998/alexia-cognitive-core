
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Clock, FileText, Brain, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  relevanceScore: number;
  type: 'memory' | 'document' | 'conversation';
  timestamp: Date;
}

const SemanticSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Conceitos de Inteligência Artificial',
      content: 'Inteligência artificial cognitiva envolve sistemas que simulam processos de pensamento humano, incluindo aprendizado, raciocínio e percepção...',
      source: 'Memória Cognitiva',
      relevanceScore: 0.95,
      type: 'memory',
      timestamp: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Arquitetura de Sistemas Distribuídos',
      content: 'Sistemas distribuídos são fundamentais para aplicações modernas, proporcionando escalabilidade e confiabilidade...',
      source: 'Manual_Alex_IA.pdf',
      relevanceScore: 0.87,
      type: 'document',
      timestamp: new Date('2024-01-10')
    },
    {
      id: '3',
      title: 'Conversa sobre Machine Learning',
      content: 'Discussão sobre algoritmos de aprendizado de máquina e suas aplicações em processamento de linguagem natural...',
      source: 'Chat Session #123',
      relevanceScore: 0.82,
      type: 'conversation',
      timestamp: new Date('2024-01-08')
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simular busca
    setTimeout(() => {
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filteredResults);
      setIsSearching(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'conversation':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'memory':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      case 'conversation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Search className="w-8 h-8 text-orange-500" />
          Busca Semântica
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Busca avançada por contexto e significado em suas memórias, documentos e conversas
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buscar por Significado</CardTitle>
          <CardDescription>
            Digite conceitos, ideias ou perguntas para encontrar conteúdo relacionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Ex: conceitos de IA, arquitetura de sistemas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Resultados da Busca ({results.length})</CardTitle>
            <CardDescription>
              Ordenados por relevância semântica
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(result.type)}
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <Badge className={getTypeColor(result.type)}>
                      {result.type === 'memory' ? 'Memória' : 
                       result.type === 'document' ? 'Documento' : 'Conversa'}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span>{result.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {result.timestamp.toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    {(result.relevanceScore * 100).toFixed(0)}% relevante
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${result.relevanceScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {result.content}
              </p>
            </CardContent>
          </Card>
        ))}

        {searchQuery && results.length === 0 && !isSearching && (
          <Card>
            <CardContent className="py-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhum resultado encontrado para "{searchQuery}"
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Tente usar termos diferentes ou mais gerais
              </p>
            </CardContent>
          </Card>
        )}

        {!searchQuery && (
          <Card>
            <CardContent className="py-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Digite algo para começar a buscar
              </p>
              <p className="text-sm text-gray-400 mt-2">
                A busca semântica encontra conteúdo baseado no significado, não apenas palavras-chave
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SemanticSearch;

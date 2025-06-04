
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simular busca semântica
    setTimeout(() => {
      setResults([]);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Busca Semântica
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Encontre informações usando busca semântica inteligente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Conteúdo</CardTitle>
          <CardDescription>
            Digite sua pergunta e encontre informações relevantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite sua busca..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Nenhum resultado encontrado. Tente fazer uma busca.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SemanticSearch;

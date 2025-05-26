
import { useState } from 'react';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, FileText, Brain, X } from 'lucide-react';

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const { searching, results, lastQuery, searchDocuments, clearResults } = useSemanticSearch();
  const { projects } = useProjects();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const projectId = selectedProject === 'all' ? undefined : 
                     selectedProject === 'none' ? 'none' : selectedProject;
    
    await searchDocuments(query, projectId, 10);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatSimilarityScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Busca Semântica
          </h1>
          <p className="text-gray-600">
            Encontre informações relevantes em seus documentos usando busca por similaridade semântica
          </p>
        </div>

        {/* Search Interface */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar nos Documentos
            </CardTitle>
            <CardDescription>
              Digite sua pergunta ou palavras-chave para encontrar trechos relevantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: Como implementar autenticação? Quais são os requisitos do projeto?"
                  className="w-full"
                />
              </div>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  <SelectItem value="none">Sem projeto</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSearch} 
                disabled={searching || !query.trim()}
                className="px-6"
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-4" />

        {/* Results Section */}
        <div className="flex-1 overflow-auto">
          {lastQuery && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Resultados para: "{lastQuery}"
              </h2>
              {results.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearResults}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          )}

          {searching && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Processando busca semântica...</p>
              </div>
            </div>
          )}

          {!searching && results.length === 0 && lastQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600">
                Tente reformular sua busca ou verificar se você tem documentos processados
              </p>
            </div>
          )}

          {!searching && results.length === 0 && !lastQuery && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Busca Semântica Inteligente
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Digite uma pergunta ou conceito acima para encontrar os trechos mais relevantes 
                em seus documentos usando inteligência artificial
              </p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Encontrados {results.length} trechos relevantes
              </p>
              
              {results.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {result.document_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Trecho {result.chunk_index + 1}
                        </Badge>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getSimilarityColor(result.similarity_score)}`}
                      >
                        {formatSimilarityScore(result.similarity_score)} similares
                      </Badge>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {result.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SemanticSearch;

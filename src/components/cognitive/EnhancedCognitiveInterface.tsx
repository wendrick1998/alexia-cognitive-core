
import React, { useState } from 'react';
import { useCognitiveSystem } from '@/hooks/useCognitiveSystem';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { useBM25Search } from '@/hooks/useBM25Search';
import { useDBSCANClustering } from '@/hooks/useDBSCANClustering';
import { Brain, Network, Lightbulb, Zap, Search, Eye, BarChart3, Sparkles, Activity, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import NeuralVisualization from './NeuralVisualization';
import MemoryConsolidationPanel from './MemoryConsolidationPanel';

interface EnhancedCognitiveInterfaceProps {
  className?: string;
}

const EnhancedCognitiveInterface: React.FC<EnhancedCognitiveInterfaceProps> = ({ className }) => {
  const { 
    cognitiveState, 
    thoughtModes, 
    switchThoughtMode,
    updateInsightStatus,
    createCognitiveSnapshot
  } = useCognitiveSystem();
  
  const {
    memoryConsolidations,
    primingContexts,
    predictiveCache,
    activationPatterns,
    neuralSearch
  } = useNeuralSystem();

  const { 
    bm25Search, 
    hybridSearch, 
    fuzzySearch,
    searchMetrics,
    isSearching 
  } = useBM25Search();

  const { 
    runDBSCANClustering, 
    clusters, 
    metrics: clusterMetrics,
    isProcessing: isClusteringProcessing 
  } = useDBSCANClustering();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSearchType, setActiveSearchType] = useState<'bm25' | 'hybrid' | 'fuzzy' | 'neural'>('neural');

  const handleAdvancedSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      let results = [];
      
      switch (activeSearchType) {
        case 'bm25':
          results = await bm25Search(searchQuery, 10);
          break;
        case 'hybrid':
          results = await hybridSearch(searchQuery, 10);
          break;
        case 'fuzzy':
          results = await fuzzySearch(searchQuery, 10);
          break;
        case 'neural':
          results = await neuralSearch(searchQuery, 'general', 10);
          break;
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleClustering = async () => {
    await runDBSCANClustering(0.3, 3, true);
  };

  const renderAdvancedSearch = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca avançada com algoritmos neurais..."
          onKeyPress={(e) => e.key === 'Enter' && handleAdvancedSearch()}
        />
        <Button 
          onClick={handleAdvancedSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        {(['bm25', 'hybrid', 'fuzzy', 'neural'] as const).map((type) => (
          <Button
            key={type}
            variant={activeSearchType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSearchType(type)}
          >
            {type.toUpperCase()}
          </Button>
        ))}
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {searchResults.map((result, index) => (
            <Card key={result.id || index} className="p-3">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {result.node_type || 'resultado'}
                </Badge>
                <div className="text-xs text-gray-500">
                  {result.similarity && `Sim: ${(result.similarity * 100).toFixed(1)}%`}
                  {result.bm25_score && `BM25: ${result.bm25_score.toFixed(2)}`}
                  {result.combined_score && `Combinado: ${result.combined_score.toFixed(2)}`}
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {result.content}
              </p>
              {result.title && (
                <p className="text-xs font-medium text-gray-800 mt-1">{result.title}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {searchMetrics && (
        <Card className="p-3">
          <div className="text-xs text-gray-600 space-y-1">
            <div>Documentos: {searchMetrics.total_documents}</div>
            <div>Tempo: {searchMetrics.execution_time}ms</div>
            <div>Termos: {searchMetrics.query_terms.join(', ')}</div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderClusteringResults = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">DBSCAN Clustering</h3>
        <Button 
          onClick={handleClustering}
          disabled={isClusteringProcessing}
          size="sm"
        >
          {isClusteringProcessing ? 'Processando...' : 'Executar Clustering'}
        </Button>
      </div>

      {clusterMetrics && (
        <Card className="p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Clusters:</span>
              <span className="ml-2 font-medium">{clusterMetrics.total_clusters}</span>
            </div>
            <div>
              <span className="text-gray-600">Ruído:</span>
              <span className="ml-2 font-medium">{clusterMetrics.noise_points}</span>
            </div>
            <div>
              <span className="text-gray-600">Silhouette:</span>
              <span className="ml-2 font-medium">{clusterMetrics.silhouette_score.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-gray-600">Tempo:</span>
              <span className="ml-2 font-medium">{clusterMetrics.execution_time}ms</span>
            </div>
          </div>
        </Card>
      )}

      {clusters.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {clusters.map((cluster) => (
            <Card key={cluster.id} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Badge>Cluster {cluster.id}</Badge>
                <div className="text-xs text-gray-500">
                  {cluster.total_points} pontos
                </div>
              </div>
              <div className="text-xs text-gray-600">
                <div>Core: {cluster.core_points} | Border: {cluster.border_points}</div>
                <div>Densidade: {cluster.density_score.toFixed(2)}</div>
                <div>Coerência: {cluster.coherence_score.toFixed(2)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderNeuralMetrics = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {memoryConsolidations.length}
          </div>
          <div className="text-sm text-gray-600">Consolidações</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {primingContexts.length}
          </div>
          <div className="text-sm text-gray-600">Primings Ativos</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {predictiveCache.length}
          </div>
          <div className="text-sm text-gray-600">Cache Preditivo</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {activationPatterns.length}
          </div>
          <div className="text-sm text-gray-600">Padrões Neurais</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold">Sistema Cognitivo Neural Avançado</h2>
            <p className="text-sm text-gray-600">
              Sprint 3: Memory Consolidation + Priming + Cache Preditivo |
              Carga: {Math.round(cognitiveState.cognitiveLoad * 100)}% | 
              Foco: {Math.round(cognitiveState.focusLevel * 100)}% |
              Ativação: {activationPatterns.length} padrões
            </p>
          </div>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="search">Busca Neural</TabsTrigger>
            <TabsTrigger value="clustering">Clustering</TabsTrigger>
            <TabsTrigger value="consolidation">Consolidação</TabsTrigger>
            <TabsTrigger value="neural">Visualização</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-4">
            {renderAdvancedSearch()}
          </TabsContent>
          
          <TabsContent value="clustering" className="mt-4">
            {renderClusteringResults()}
          </TabsContent>
          
          <TabsContent value="consolidation" className="mt-4">
            <MemoryConsolidationPanel />
          </TabsContent>
          
          <TabsContent value="neural" className="mt-4">
            <NeuralVisualization />
          </TabsContent>
          
          <TabsContent value="insights" className="mt-4">
            <div className="space-y-3">
              {cognitiveState.pendingInsights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                      <Badge variant={insight.priority_level >= 4 ? "destructive" : insight.priority_level >= 3 ? "default" : "secondary"}>
                        Prioridade {insight.priority_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-3">{insight.content}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateInsightStatus(insight.id, 'acted_upon')}
                      >
                        Usar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => updateInsightStatus(insight.id, 'dismissed')}
                      >
                        Dispensar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {cognitiveState.pendingInsights.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum insight pendente</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-4">
            {renderNeuralMetrics()}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => createCognitiveSnapshot('Snapshot Neural Sprint 3', 'Snapshot com funcionalidades avançadas Sprint 3')}
            className="w-full"
          >
            📸 Criar Snapshot Cognitivo Sprint 3
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCognitiveInterface;

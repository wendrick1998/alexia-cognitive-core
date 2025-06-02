
import React, { useState } from 'react';
import { useCognitiveSystem } from '@/hooks/useCognitiveSystem';
import { useHybridRAG } from '@/hooks/useHybridRAG';
import { useBM25Search } from '@/hooks/useBM25Search';
import { useDBSCANClustering } from '@/hooks/useDBSCANClustering';
import { Brain, Search, Network, Activity, BarChart, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const EnhancedCognitiveInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchResults, setLastSearchResults] = useState<any[]>([]);
  
  // Hooks
  const { cognitiveState, neural } = useCognitiveSystem();
  const { hybridSearch, searchMetrics, isSearching } = useHybridRAG();
  const { bm25Search, searchMetrics: bm25Metrics } = useBM25Search();
  const { runDBSCANClustering, clusters, metrics, isProcessing } = useDBSCANClustering();

  const handleHybridSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await hybridSearch(searchQuery, {
        maxResults: 10,
        diversityWeight: 0.3
      });
      setLastSearchResults(results);
    } catch (error) {
      console.error('Erro na busca híbrida:', error);
    }
  };

  const handleBM25Search = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await bm25Search(searchQuery, 10);
      setLastSearchResults(results);
    } catch (error) {
      console.error('Erro na busca BM25:', error);
    }
  };

  const handleClustering = async () => {
    try {
      // Get sample data or existing cognitive nodes for clustering
      await runDBSCANClustering([], {
        epsilon: 0.5,
        minPoints: 3
      });
    } catch (error) {
      console.error('Erro no clustering:', error);
    }
  };

  const renderSearchInterface = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Digite sua consulta de busca..."
          onKeyPress={(e) => e.key === 'Enter' && handleHybridSearch()}
        />
        <Button 
          onClick={handleHybridSearch}
          disabled={isSearching}
          variant="default"
        >
          <Search className="w-4 h-4 mr-2" />
          Híbrida
        </Button>
        <Button 
          onClick={handleBM25Search}
          disabled={isSearching}
          variant="outline"
        >
          <Search className="w-4 h-4 mr-2" />
          BM25
        </Button>
      </div>

      {lastSearchResults.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {lastSearchResults.slice(0, 5).map((result, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">
                    {result.retrieval_method || 'search'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Score: {(result.combined_score || result.score || 0).toFixed(3)}
                  </span>
                </div>
                <h4 className="text-sm font-medium mb-1">
                  {result.title || 'Resultado'}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {result.content.substring(0, 150)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSearchMetrics = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {searchMetrics?.totalResults || bm25Metrics?.totalDocuments || 0}
          </div>
          <div className="text-sm text-gray-600">Documentos</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {searchMetrics?.totalTime || bm25Metrics?.searchLatency || 0}ms
          </div>
          <div className="text-sm text-gray-600">Tempo</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClusteringInterface = () => (
    <div className="space-y-4">
      <Button 
        onClick={handleClustering}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Activity className="w-4 h-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Network className="w-4 h-4 mr-2" />
            Executar DBSCAN Clustering
          </>
        )}
      </Button>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-bold text-purple-600">{metrics.totalClusters}</div>
          <div className="text-gray-600">Clusters</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-red-600">{metrics.noisePoints}</div>
          <div className="text-gray-600">Ruído</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-green-600">
            {(metrics.silhouetteScore * 100).toFixed(0)}%
          </div>
          <div className="text-gray-600">Qualidade</div>
        </div>
      </div>

      {clusters.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {clusters.slice(0, 3).map((cluster) => (
            <Card key={cluster.id} className="border border-gray-200">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">Cluster {cluster.id}</Badge>
                  <span className="text-xs text-gray-500">
                    {cluster.points.length} pontos
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div>Densidade: {cluster.density.toFixed(3)}</div>
                  <div>Coesão: {cluster.cohesion.toFixed(3)}</div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cluster.topics.slice(0, 3).map((topic, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderNeuralActivity = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cognitiveState.activeNodes.length}
            </div>
            <div className="text-sm text-gray-600">Nós Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {neural.activationPatterns.length}
            </div>
            <div className="text-sm text-gray-600">Padrões</div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={() => neural.loadActivationPatterns()}
        disabled={neural.isProcessing}
        className="w-full"
      >
        <Brain className="w-4 h-4 mr-2" />
        Atualizar Padrões Neurais
      </Button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-600" />
        <div>
          <h2 className="text-xl font-semibold">Sistema Cognitivo Avançado</h2>
          <p className="text-sm text-gray-600">
            Busca Híbrida, Clustering e Processamento Neural
          </p>
        </div>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Busca</TabsTrigger>
          <TabsTrigger value="clustering">Clustering</TabsTrigger>
          <TabsTrigger value="neural">Neural</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-4">
          {renderSearchInterface()}
        </TabsContent>
        
        <TabsContent value="clustering" className="mt-4">
          {renderClusteringInterface()}
        </TabsContent>
        
        <TabsContent value="neural" className="mt-4">
          {renderNeuralActivity()}
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          {renderSearchMetrics()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCognitiveInterface;

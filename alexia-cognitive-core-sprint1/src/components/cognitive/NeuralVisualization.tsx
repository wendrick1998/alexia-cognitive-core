
import React, { useEffect, useRef, useState } from 'react';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { useBM25Search } from '@/hooks/useBM25Search';
import { useDBSCANClustering } from '@/hooks/useDBSCANClustering';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Brain, Zap, Network, Activity, Search, Layers, BarChart3 } from 'lucide-react';

interface NeuralVisualizationProps {
  className?: string;
}

const NeuralVisualization: React.FC<NeuralVisualizationProps> = ({ className }) => {
  const neural = useNeuralSystem();
  const bm25 = useBM25Search();
  const clustering = useDBSCANClustering();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });

  // Load network topology
  useEffect(() => {
    const loadNetwork = async () => {
      const data = await neural.getNetworkTopology();
      setNetworkData(data);
    };

    loadNetwork();
  }, [neural]);

  // Enhanced 2D neural network visualization with clusters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || networkData.nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw cluster backgrounds if available
    if (clustering.clusters.length > 0) {
      clustering.clusters.forEach((cluster, index) => {
        const clusterNodes = clustering.clusterNodes.filter(n => n.cluster_id === cluster.id);
        if (clusterNodes.length === 0) return;

        // Calculate cluster bounds
        const positions = clusterNodes.map(node => {
          const nodeIndex = networkData.nodes.findIndex(n => n.id === node.id);
          if (nodeIndex === -1) return null;
          
          const angle = (nodeIndex / networkData.nodes.length) * 2 * Math.PI;
          const radius = Math.min(width, height) * 0.35;
          return {
            x: width / 2 + Math.cos(angle) * radius,
            y: height / 2 + Math.sin(angle) * radius
          };
        }).filter(Boolean);

        if (positions.length === 0) return;

        // Draw cluster background
        ctx.fillStyle = `hsla(${(index * 60) % 360}, 50%, 80%, 0.2)`;
        ctx.beginPath();
        positions.forEach((pos, i) => {
          if (i === 0) ctx.moveTo(pos!.x, pos!.y);
          else ctx.lineTo(pos!.x, pos!.y);
        });
        ctx.closePath();
        ctx.fill();
      });
    }

    // Draw connections
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    networkData.edges.forEach(edge => {
      const sourceNode = networkData.nodes.find(n => n.id === edge.source);
      const targetNode = networkData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceAngle = (networkData.nodes.indexOf(sourceNode) / networkData.nodes.length) * 2 * Math.PI;
        const targetAngle = (networkData.nodes.indexOf(targetNode) / networkData.nodes.length) * 2 * Math.PI;
        
        const radius = Math.min(width, height) * 0.35;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const sourceX = centerX + Math.cos(sourceAngle) * radius;
        const sourceY = centerY + Math.sin(sourceAngle) * radius;
        const targetX = centerX + Math.cos(targetAngle) * radius;
        const targetY = centerY + Math.sin(targetAngle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
    });

    // Draw nodes
    networkData.nodes.forEach((node, index) => {
      const angle = (index / networkData.nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.35;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      
      // Get cluster info if available
      const clusterNode = clustering.clusterNodes.find(cn => cn.id === node.id);
      const clusterId = clusterNode?.cluster_id || -1;
      
      // Node size based on activation or access count
      const nodeRadius = 5 + (node.access_count || 0.1) * 2;
      
      // Color based on cluster or activation
      if (clusterId >= 0) {
        ctx.fillStyle = `hsl(${(clusterId * 60) % 360}, 70%, 60%)`;
      } else {
        const activation = node.access_count || 0.1;
        if (activation > 10) {
          ctx.fillStyle = '#ef4444'; // High activity - red
        } else if (activation > 5) {
          ctx.fillStyle = '#f59e0b'; // Medium activity - orange
        } else if (activation > 1) {
          ctx.fillStyle = '#10b981'; // Low activity - green
        } else {
          ctx.fillStyle = '#6b7280'; // Dormant - gray
        }
      }
      
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Highlight selected node
      if (selectedNode === node.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  }, [networkData, selectedNode, clustering.clusters, clustering.clusterNodes]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    networkData.nodes.forEach((node, index) => {
      const angle = (index / networkData.nodes.length) * 2 * Math.PI;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;
      const nodeX = canvas.width / 2 + Math.cos(angle) * radius;
      const nodeY = canvas.height / 2 + Math.sin(angle) * radius;
      const nodeRadius = 5 + (node.access_count || 0.1) * 2;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance <= nodeRadius) {
        setSelectedNode(node.id);
        neural.accessNode(node.id, 0.2);
      }
    });
  };

  const handleBM25Search = async () => {
    if (!searchQuery.trim()) return;
    
    const results = await bm25.bm25Search(searchQuery, 10);
    setSearchResults(results);
  };

  const handleHybridSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const results = await bm25.hybridSearch(searchQuery, 10);
    setSearchResults(results);
  };

  const triggerSpreadActivation = async () => {
    if (selectedNode) {
      await neural.spreadActivation(selectedNode, 0.5, 3);
      const data = await neural.getNetworkTopology();
      setNetworkData(data);
    }
  };

  const runClustering = async () => {
    await clustering.runDBSCANClustering(0.3, 3, true);
    // Reload visualization to show clusters
    const data = await neural.getNetworkTopology();
    setNetworkData(data);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Rede Neural Cognitiva Avançada
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {networkData.nodes.length} nós
              </Badge>
              <Badge variant="outline">
                {clustering.clusters.length} clusters
              </Badge>
              <Badge variant="outline">
                {networkData.edges.length} conexões
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="border border-gray-200 rounded-lg cursor-pointer w-full"
              onClick={handleCanvasClick}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            <div className="flex flex-wrap items-center gap-2">
              {selectedNode && (
                <Button
                  onClick={triggerSpreadActivation}
                  disabled={neural.isProcessing}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Propagar Ativação
                </Button>
              )}
              
              <Button
                onClick={runClustering}
                disabled={clustering.isProcessing}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Executar DBSCAN
              </Button>
              
              {selectedNode && (
                <span className="text-sm text-gray-600">
                  Nó selecionado: {selectedNode.substring(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Busca BM25</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Busca Avançada BM25
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua busca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBM25Search()}
                />
                <Button onClick={handleBM25Search} disabled={bm25.isSearching}>
                  BM25
                </Button>
                <Button onClick={handleHybridSearch} disabled={bm25.isSearching} variant="outline">
                  Híbrida
                </Button>
              </div>
              
              {bm25.searchMetrics && (
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  <div>Documentos: {bm25.searchMetrics.total_documents}</div>
                  <div>Tempo: {bm25.searchMetrics.execution_time}ms</div>
                  <div>Termos: {bm25.searchMetrics.query_terms.join(', ')}</div>
                </div>
              )}
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div key={result.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">{result.node_type}</Badge>
                      <div className="flex gap-2">
                        {result.bm25_score && (
                          <Badge variant="secondary">
                            BM25: {result.bm25_score.toFixed(2)}
                          </Badge>
                        )}
                        {result.semantic_score && (
                          <Badge variant="secondary">
                            Sem: {result.semantic_score.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.content.substring(0, 150)}...
                    </p>
                    {result.term_matches && result.term_matches.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.term_matches.map((term: string) => (
                          <Badge key={term} variant="outline" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clusters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Clusters DBSCAN
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clustering.metrics && (
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                  <div>Total de Clusters: {clustering.metrics.total_clusters}</div>
                  <div>Pontos de Ruído: {clustering.metrics.noise_points}</div>
                  <div>Score Silhouette: {clustering.metrics.silhouette_score.toFixed(2)}</div>
                  <div>Tempo: {clustering.metrics.execution_time}ms</div>
                  <div>Parâmetros: eps={clustering.metrics.parameters.eps}, min_points={clustering.metrics.parameters.min_points}</div>
                </div>
              )}
              
              <div className="space-y-3">
                {clustering.clusters.map((cluster) => (
                  <div key={cluster.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Cluster {cluster.id}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {cluster.total_points} nós
                        </Badge>
                        <Badge variant="secondary">
                          Densidade: {(cluster.density_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Core Points: {cluster.core_points} | Border Points: {cluster.border_points}
                    </div>
                  </div>
                ))}
                
                {clustering.clusters.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum cluster detectado</p>
                    <Button 
                      onClick={runClustering}
                      disabled={clustering.isProcessing}
                      size="sm"
                      className="mt-2"
                    >
                      Executar Clustering
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patterns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Padrões de Ativação Neural
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {neural.activationPatterns.slice(0, 5).map((pattern) => (
                  <div key={pattern.node_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {pattern.node_id.substring(0, 8)}...
                        </span>
                      </div>
                      <Badge 
                        variant={pattern.activation_strength > 0.7 ? "destructive" : 
                                 pattern.activation_strength > 0.4 ? "default" : "secondary"}
                      >
                        {(pattern.activation_strength * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{pattern.connected_count} conexões</span>
                      <span>Prof. {pattern.propagation_depth}</span>
                    </div>
                  </div>
                ))}
                
                {neural.activationPatterns.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum padrão de ativação detectado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {networkData.nodes.length}
                </div>
                <div className="text-sm text-gray-600">Nós Neurais</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {clustering.clusters.length}
                </div>
                <div className="text-sm text-gray-600">Clusters DBSCAN</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {neural.activationPatterns.length}
                </div>
                <div className="text-sm text-gray-600">Padrões Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {bm25.searchMetrics?.execution_time || 0}ms
                </div>
                <div className="text-sm text-gray-600">Tempo BM25</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NeuralVisualization;

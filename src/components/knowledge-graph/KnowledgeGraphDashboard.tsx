
import React, { useState, useMemo } from 'react';
import { useKnowledgeGraph3D } from '@/hooks/useKnowledgeGraph3D';
import { useHybridRAG } from '@/hooks/useHybridRAG';
import KnowledgeGraph3DCanvas from './KnowledgeGraph3DCanvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Search, 
  Layers, 
  Network, 
  BarChart3, 
  Clock, 
  Zap,
  Eye,
  Cpu,
  Activity
} from 'lucide-react';

const KnowledgeGraphDashboard: React.FC = () => {
  const {
    nodes,
    edges,
    clusters,
    isLoading,
    selectedNode,
    setSelectedNode,
    hoveredNode,
    setHoveredNode,
    searchQuery,
    setSearchQuery,
    filteredNodes,
    timeline,
    updateTimeline,
    playTimeline,
    loadGraphData,
    generateClusters
  } = useKnowledgeGraph3D();

  const {
    hybridSearch,
    isSearching,
    searchResults,
    searchMetrics
  } = useHybridRAG();

  const [showClusters, setShowClusters] = useState(false);
  const [showEdges, setShowEdges] = useState(true);
  const [selectedTab, setSelectedTab] = useState('3d');
  const [ragQuery, setRagQuery] = useState('');

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    const avgActivation = nodes.reduce((sum, node) => sum + node.activation_strength, 0) / totalNodes || 0;
    const density = totalNodes > 1 ? (totalEdges * 2) / (totalNodes * (totalNodes - 1)) : 0;
    
    const memoryDistribution = nodes.reduce((acc, node) => {
      acc[node.memory_type] = (acc[node.memory_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeDistribution = nodes.reduce((acc, node) => {
      acc[node.node_type] = (acc[node.node_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNodes,
      totalEdges,
      avgActivation,
      density,
      memoryDistribution,
      typeDistribution,
      clustersCount: clusters.length
    };
  }, [nodes, edges, clusters]);

  const selectedNodeData = useMemo(() => {
    return selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  }, [selectedNode, nodes]);

  const handleHybridSearch = async () => {
    if (ragQuery.trim()) {
      await hybridSearch(ragQuery);
    }
  };

  const formatTime = (ms: number) => `${ms.toFixed(0)}ms`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="w-full h-screen bg-gray-900 p-4">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Main 3D Visualization */}
        <div className="col-span-8 bg-black rounded-lg relative">
          <KnowledgeGraph3DCanvas
            nodes={nodes}
            edges={edges}
            clusters={clusters}
            selectedNode={selectedNode}
            hoveredNode={hoveredNode}
            filteredNodes={filteredNodes}
            showClusters={showClusters}
            showEdges={showEdges}
            onNodeSelect={setSelectedNode}
            onNodeHover={setHoveredNode}
          />
          
          {/* Overlay Controls */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdges(!showEdges)}
              className="bg-black/50 text-white border-white/20"
            >
              <Network className="w-4 h-4 mr-1" />
              {showEdges ? 'Hide' : 'Show'} Edges
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClusters(!showClusters)}
              className="bg-black/50 text-white border-white/20"
            >
              <Layers className="w-4 h-4 mr-1" />
              {showClusters ? 'Hide' : 'Show'} Clusters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateClusters}
              className="bg-black/50 text-white border-white/20"
            >
              <Cpu className="w-4 h-4 mr-1" />
              Re-cluster
            </Button>
          </div>

          {/* Search Bar */}
          <div className="absolute top-4 right-4 w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge graph..."
                className="pl-10 bg-black/50 text-white border-white/20"
              />
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 animate-spin" />
                Loading knowledge graph...
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="col-span-4 space-y-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="3d">3D</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="rag">RAG</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="3d" className="space-y-4">
              {/* Selected Node Details */}
              {selectedNodeData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Selected Node
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Badge variant="outline">
                        {selectedNodeData.node_type}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {selectedNodeData.memory_type}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Content:</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedNodeData.content.substring(0, 200)}...
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Activation:</span>
                        <div className="font-medium">
                          {formatPercent(selectedNodeData.activation_strength)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Relevance:</span>
                        <div className="font-medium">
                          {formatPercent(selectedNodeData.relevance_score)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Connections:</span>
                        <div className="font-medium">
                          {selectedNodeData.connections.length}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <div className="font-medium">
                          {selectedNodeData.size.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Graph Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Graph Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Edges</span>
                    <Switch checked={showEdges} onCheckedChange={setShowEdges} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Clusters</span>
                    <Switch checked={showClusters} onCheckedChange={setShowClusters} />
                  </div>
                  
                  <Button 
                    onClick={() => loadGraphData()}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Refresh Graph
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Graph Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nodes:</span>
                      <div className="text-xl font-bold">{analytics.totalNodes}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Edges:</span>
                      <div className="text-xl font-bold">{analytics.totalEdges}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Density:</span>
                      <div className="text-xl font-bold">{formatPercent(analytics.density)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Activation:</span>
                      <div className="text-xl font-bold">{formatPercent(analytics.avgActivation)}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Memory Distribution</h4>
                    <div className="space-y-1">
                      {Object.entries(analytics.memoryDistribution).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="capitalize">{type}:</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Node Types</h4>
                    <div className="space-y-1">
                      {Object.entries(analytics.typeDistribution).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="capitalize">{type}:</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Clusters:</span>
                      <span>{analytics.clustersCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rag" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Hybrid RAG Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="Enter hybrid search query..."
                      onKeyPress={(e) => e.key === 'Enter' && handleHybridSearch()}
                    />
                    <Button 
                      onClick={handleHybridSearch}
                      disabled={isSearching || !ragQuery.trim()}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {searchMetrics.totalTime > 0 && (
                    <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>Total Time:</span>
                        <span>{formatTime(searchMetrics.totalTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BM25:</span>
                        <span>{formatTime(searchMetrics.bm25Time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Semantic:</span>
                        <span>{formatTime(searchMetrics.semanticTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Graph:</span>
                        <span>{formatTime(searchMetrics.graphTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Results:</span>
                        <span>{searchMetrics.totalResults}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Diversity:</span>
                        <span>{formatPercent(searchMetrics.diversityScore)}</span>
                      </div>
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {searchResults.map((result, index) => (
                      <div key={result.id} className="p-2 border rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {result.retrieval_method}
                          </Badge>
                          <span className="text-gray-500">
                            Score: {result.combined_score.toFixed(3)}
                          </span>
                        </div>
                        <div className="font-medium">{result.title}</div>
                        <div className="text-gray-600 mt-1">
                          {result.content.substring(0, 100)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playTimeline}
                    >
                      {timeline.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <span className="text-sm">
                      {timeline.isPlaying ? 'Playing' : 'Paused'}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Time Range</label>
                    <div className="text-xs text-gray-500 mt-1">
                      {timeline.startTime.toLocaleDateString()} - {timeline.endTime.toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Current Time</label>
                    <div className="text-sm font-medium">
                      {timeline.currentTime.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Playback Speed</label>
                    <Slider
                      value={[timeline.speed]}
                      onValueChange={([value]) => 
                        setTimeline(prev => ({ ...prev, speed: value }))
                      }
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {timeline.speed}x speed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphDashboard;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Network, Search, Filter, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  size: number;
  color: string;
  x?: number;
  y?: number;
  connections: string[];
  metadata: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: string;
  color: string;
}

interface Graph3DData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: Array<{
    id: string;
    nodes: string[];
    color: string;
    label: string;
  }>;
}

const CognitiveGraph3Panel: React.FC = () => {
  const { user } = useAuth();
  const [graphData, setGraphData] = useState<Graph3DData>({ nodes: [], edges: [], clusters: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Load graph data from Supabase
  const loadGraphData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('🔍 Loading cognitive graph data...');

      // Load nodes from cognitive_nodes
      const { data: cognitiveNodes, error: nodesError } = await supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('relevance_score', { ascending: false })
        .limit(100);

      if (nodesError) throw nodesError;

      // Load connections
      const { data: connections, error: connectionsError } = await supabase
        .from('cognitive_connections')
        .select('*')
        .eq('user_id', user.id)
        .limit(200);

      if (connectionsError) throw connectionsError;

      // Convert to graph format
      const nodes: GraphNode[] = (cognitiveNodes || []).map(node => ({
        id: node.id,
        label: node.title || node.content.substring(0, 30) + '...',
        type: node.node_type,
        size: 20 + (node.relevance_score * 30),
        color: getNodeColor(node.node_type),
        connections: node.connected_nodes || [],
        metadata: {
          content: node.content,
          relevance: node.relevance_score,
          accessCount: node.access_count,
          activation: node.activation_strength
        }
      }));

      const edges: GraphEdge[] = (connections || []).map(conn => ({
        id: `${conn.source_node_id}-${conn.target_node_id}`,
        source: conn.source_node_id,
        target: conn.target_node_id,
        weight: conn.strength || 0.5,
        type: conn.connection_type,
        color: getEdgeColor(conn.connection_type)
      }));

      // Create clusters based on node types
      const nodeTypes = [...new Set(nodes.map(n => n.type))];
      const clusters = nodeTypes.map((type, index) => ({
        id: type,
        nodes: nodes.filter(n => n.type === type).map(n => n.id),
        color: getNodeColor(type),
        label: type.replace('_', ' ').toUpperCase()
      }));

      setGraphData({ nodes, edges, clusters });
      console.log(`✅ Loaded graph: ${nodes.length} nodes, ${edges.length} edges`);

    } catch (error) {
      console.error('❌ Error loading graph data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get node color based on type
  const getNodeColor = useCallback((type: string): string => {
    const colors = {
      'question': '#3b82f6',
      'answer': '#10b981',
      'decision': '#f59e0b',
      'insight': '#8b5cf6',
      'code': '#ef4444',
      'design': '#ec4899',
      'document': '#6b7280',
      'conversation': '#06b6d4',
      'project': '#84cc16',
      'memory': '#f97316',
      'connection': '#64748b'
    };
    return colors[type as keyof typeof colors] || '#64748b';
  }, []);

  // Get edge color based on type
  const getEdgeColor = useCallback((type: string): string => {
    const colors = {
      'similarity': '#3b82f6',
      'reference': '#10b981',
      'dependency': '#f59e0b',
      'association': '#8b5cf6',
      'temporal': '#ef4444'
    };
    return colors[type as keyof typeof colors] || '#64748b';
  }, []);

  // Filter nodes based on search and filter
  const filteredData = useCallback(() => {
    let filteredNodes = graphData.nodes;
    
    if (searchQuery) {
      filteredNodes = filteredNodes.filter(node => 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.metadata.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedFilter !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.type === selectedFilter);
    }
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    
    return { 
      nodes: filteredNodes, 
      edges: filteredEdges, 
      clusters: graphData.clusters 
    };
  }, [graphData, searchQuery, selectedFilter]);

  // Render 2D graph on canvas
  const render2DGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { nodes, edges } = filteredData();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    
    // Position nodes in a force-directed layout (simplified)
    const centerX = canvas.width / (2 * zoomLevel);
    const centerY = canvas.height / (2 * zoomLevel);
    
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.min(centerX, centerY) * 0.7;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });
    
    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode && sourceNode.x && sourceNode.y && targetNode.x && targetNode.y) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = edge.color + '80'; // Add transparency
        ctx.lineWidth = edge.weight * 3;
        ctx.stroke();
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      if (node.x && node.y) {
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = selectedNode?.id === node.id ? '#000' : '#fff';
        ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1;
        ctx.stroke();
        
        // Node label
        if (zoomLevel > 0.5) {
          ctx.fillStyle = '#000';
          ctx.font = `${Math.max(10, 12 * zoomLevel)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(
            node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label,
            node.x,
            node.y + node.size / 2 + 15
          );
        }
      }
    });
    
    ctx.restore();
  }, [filteredData, zoomLevel, selectedNode]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel;
    const y = (event.clientY - rect.top) / zoomLevel;

    const { nodes } = filteredData();
    
    // Find clicked node
    const clickedNode = nodes.find(node => {
      if (!node.x || !node.y) return false;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance < node.size / 2;
    });

    setSelectedNode(clickedNode || null);
  }, [filteredData, zoomLevel]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render2DGraph();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (graphData.nodes.length > 0) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render2DGraph, graphData.nodes.length]);

  // Initialize
  useEffect(() => {
    if (user) {
      loadGraphData();
    }
  }, [user, loadGraphData]);

  const nodeTypes = [...new Set(graphData.nodes.map(n => n.type))];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Cognitive Graph 3D
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                {nodeTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.2))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono w-12 text-center">
                {(zoomLevel * 100).toFixed(0)}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(1)}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            
            <Button
              size="sm"
              onClick={loadGraphData}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Graph Canvas */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-96 border border-gray-200 cursor-pointer"
              onClick={handleCanvasClick}
            />
            
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading graph data...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Node Details */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedNode.color }}
              />
              Node Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Label:</span> {selectedNode.label}
              </div>
              <div>
                <span className="font-medium">Type:</span>{' '}
                <Badge variant="secondary">{selectedNode.type}</Badge>
              </div>
              <div>
                <span className="font-medium">Content:</span>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedNode.metadata.content.substring(0, 200)}...
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Relevance:</span>{' '}
                  {(selectedNode.metadata.relevance * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="font-medium">Access Count:</span>{' '}
                  {selectedNode.metadata.accessCount}
                </div>
                <div>
                  <span className="font-medium">Activation:</span>{' '}
                  {(selectedNode.metadata.activation * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="font-medium">Connections:</span>{' '}
                  {selectedNode.connections.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredData().nodes.length}
            </div>
            <div className="text-sm text-gray-600">Nodes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredData().edges.length}
            </div>
            <div className="text-sm text-gray-600">Connections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {graphData.clusters.length}
            </div>
            <div className="text-sm text-gray-600">Clusters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {nodeTypes.length}
            </div>
            <div className="text-sm text-gray-600">Types</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CognitiveGraph3Panel;

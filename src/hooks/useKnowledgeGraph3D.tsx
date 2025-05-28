
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCognitiveSystem } from '@/hooks/useCognitiveSystem';
import { supabase } from '@/integrations/supabase/client';

export interface GraphNode3D {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  content: string;
  title?: string;
  node_type: string;
  activation_strength: number;
  connections: string[];
  size: number;
  color: string;
  memory_type: string;
  last_accessed: string;
  relevance_score: number;
}

export interface GraphEdge3D {
  id: string;
  source: string;
  target: string;
  strength: number;
  type: string;
  width: number;
}

export interface GraphCluster {
  id: string;
  nodes: string[];
  center: { x: number; y: number; z: number };
  color: string;
  label: string;
  density: number;
}

export interface TimelineState {
  currentTime: Date;
  startTime: Date;
  endTime: Date;
  isPlaying: boolean;
  speed: number;
}

export function useKnowledgeGraph3D() {
  const { user } = useAuth();
  const { cognitiveState } = useCognitiveSystem();
  
  const [nodes, setNodes] = useState<GraphNode3D[]>([]);
  const [edges, setEdges] = useState<GraphEdge3D[]>([]);
  const [clusters, setClusters] = useState<GraphCluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<Set<string>>(new Set());
  const [timeline, setTimeline] = useState<TimelineState>({
    currentTime: new Date(),
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endTime: new Date(),
    isPlaying: false,
    speed: 1
  });

  const simulationRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  // Color mapping for different node types and memory types
  const getNodeColor = useCallback((node_type: string, memory_type: string, activation: number) => {
    const baseColors = {
      'question': '#3B82F6',
      'answer': '#10B981', 
      'decision': '#F59E0B',
      'insight': '#8B5CF6',
      'code': '#EF4444',
      'design': '#EC4899',
      'document': '#6B7280',
      'conversation': '#14B8A6',
      'project': '#F97316',
      'memory': '#84CC16',
      'connection': '#06B6D4'
    };

    const memoryModifiers = {
      'working': 1.0,
      'short_term': 0.8,
      'long_term': 0.6
    };

    const baseColor = baseColors[node_type as keyof typeof baseColors] || '#6B7280';
    const modifier = memoryModifiers[memory_type as keyof typeof memoryModifiers] || 1.0;
    const intensity = Math.min(1.0, activation * modifier);
    
    return `${baseColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
  }, []);

  // Load graph data from cognitive system
  const loadGraphData = useCallback(async (timeFilter?: { start: Date; end: Date }) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('🗺️ Loading 3D knowledge graph data...');

      // Load nodes with time filtering
      let query = supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('activation_strength', { ascending: false });

      if (timeFilter) {
        query = query
          .gte('created_at', timeFilter.start.toISOString())
          .lte('created_at', timeFilter.end.toISOString());
      }

      const { data: nodeData, error: nodeError } = await query.limit(200);
      if (nodeError) throw nodeError;

      // Load connections
      const { data: connectionData, error: connectionError } = await supabase
        .from('cognitive_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('strength', { ascending: false })
        .limit(500);

      if (connectionError) throw connectionError;

      // Transform nodes to 3D format
      const graph3DNodes: GraphNode3D[] = (nodeData || []).map((node, index) => {
        const angle = (index / (nodeData?.length || 1)) * 2 * Math.PI;
        const radius = 10 + (node.activation_strength * 20);
        const height = (Math.random() - 0.5) * 10;

        return {
          id: node.id,
          position: {
            x: Math.cos(angle) * radius,
            y: height,
            z: Math.sin(angle) * radius
          },
          velocity: { x: 0, y: 0, z: 0 },
          content: node.content,
          title: node.title,
          node_type: node.node_type,
          activation_strength: node.activation_strength || 0.5,
          connections: node.connected_nodes || [],
          size: 0.5 + (node.activation_strength * 2),
          color: getNodeColor(node.node_type, node.memory_type || 'working', node.activation_strength || 0.5),
          memory_type: node.memory_type || 'working',
          last_accessed: node.last_accessed_at,
          relevance_score: node.relevance_score
        };
      });

      // Transform connections to 3D edges
      const graph3DEdges: GraphEdge3D[] = (connectionData || [])
        .filter(conn => 
          graph3DNodes.some(n => n.id === conn.source_node_id) &&
          graph3DNodes.some(n => n.id === conn.target_node_id)
        )
        .map(conn => ({
          id: conn.id,
          source: conn.source_node_id,
          target: conn.target_node_id,
          strength: conn.strength,
          type: conn.connection_type,
          width: Math.max(0.1, conn.strength * 2)
        }));

      setNodes(graph3DNodes);
      setEdges(graph3DEdges);

      console.log(`✅ Loaded ${graph3DNodes.length} nodes and ${graph3DEdges.length} edges`);
    } catch (error) {
      console.error('❌ Error loading graph data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, getNodeColor]);

  // Physics simulation for force-directed layout
  const runPhysicsSimulation = useCallback(() => {
    if (nodes.length === 0) return;

    const step = () => {
      setNodes(prevNodes => {
        const newNodes = [...prevNodes];
        const forces = new Map<string, { x: number; y: number; z: number }>();

        // Initialize forces
        newNodes.forEach(node => {
          forces.set(node.id, { x: 0, y: 0, z: 0 });
        });

        // Repulsion forces between all nodes
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const nodeA = newNodes[i];
            const nodeB = newNodes[j];
            
            const dx = nodeA.position.x - nodeB.position.x;
            const dy = nodeA.position.y - nodeB.position.y;
            const dz = nodeA.position.z - nodeB.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
            
            const repulsion = 50 / (distance * distance);
            const forceX = (dx / distance) * repulsion;
            const forceY = (dy / distance) * repulsion;
            const forceZ = (dz / distance) * repulsion;
            
            const forceA = forces.get(nodeA.id)!;
            const forceB = forces.get(nodeB.id)!;
            
            forceA.x += forceX;
            forceA.y += forceY;
            forceA.z += forceZ;
            forceB.x -= forceX;
            forceB.y -= forceY;
            forceB.z -= forceZ;
          }
        }

        // Attraction forces for connected nodes
        edges.forEach(edge => {
          const sourceNode = newNodes.find(n => n.id === edge.source);
          const targetNode = newNodes.find(n => n.id === edge.target);
          
          if (sourceNode && targetNode) {
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const dz = targetNode.position.z - sourceNode.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
            
            const idealDistance = 5;
            const attraction = (distance - idealDistance) * 0.1 * edge.strength;
            const forceX = (dx / distance) * attraction;
            const forceY = (dy / distance) * attraction;
            const forceZ = (dz / distance) * attraction;
            
            const sourceForce = forces.get(sourceNode.id)!;
            const targetForce = forces.get(targetNode.id)!;
            
            sourceForce.x += forceX;
            sourceForce.y += forceY;
            sourceForce.z += forceZ;
            targetForce.x -= forceX;
            targetForce.y -= forceY;
            targetForce.z -= forceZ;
          }
        });

        // Apply forces and update positions
        newNodes.forEach(node => {
          const force = forces.get(node.id)!;
          const damping = 0.9;
          
          node.velocity.x = (node.velocity.x + force.x * 0.1) * damping;
          node.velocity.y = (node.velocity.y + force.y * 0.1) * damping;
          node.velocity.z = (node.velocity.z + force.z * 0.1) * damping;
          
          node.position.x += node.velocity.x;
          node.position.y += node.velocity.y;
          node.position.z += node.velocity.z;
        });

        return newNodes;
      });

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);
  }, [nodes.length, edges]);

  // Search and filtering
  const searchNodes = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFilteredNodes(new Set());
      return;
    }

    try {
      console.log('🔍 Searching knowledge graph:', query);
      
      const searchResults = new Set<string>();
      
      // Local search in loaded nodes
      nodes.forEach(node => {
        if (
          node.content.toLowerCase().includes(query.toLowerCase()) ||
          node.title?.toLowerCase().includes(query.toLowerCase())
        ) {
          searchResults.add(node.id);
          
          // Include connected nodes
          node.connections.forEach(connId => {
            searchResults.add(connId);
          });
        }
      });

      setFilteredNodes(searchResults);
      
      // Highlight search results
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          size: searchResults.has(node.id) 
            ? node.size * 1.5 
            : searchResults.size > 0 
              ? node.size * 0.7 
              : node.size
        }))
      );

    } catch (error) {
      console.error('❌ Search error:', error);
    }
  }, [nodes]);

  // Clustering using simple density-based approach
  const generateClusters = useCallback(() => {
    if (nodes.length === 0) return;

    const clusters: GraphCluster[] = [];
    const visited = new Set<string>();
    const eps = 8; // Distance threshold
    const minPts = 3; // Minimum points for cluster

    nodes.forEach(node => {
      if (visited.has(node.id)) return;

      const neighbors = nodes.filter(other => {
        if (other.id === node.id) return false;
        const dx = node.position.x - other.position.x;
        const dy = node.position.y - other.position.y;
        const dz = node.position.z - other.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return distance <= eps;
      });

      if (neighbors.length >= minPts) {
        const clusterNodes = [node, ...neighbors];
        clusterNodes.forEach(n => visited.add(n.id));

        // Calculate cluster center
        const center = clusterNodes.reduce(
          (acc, n) => ({
            x: acc.x + n.position.x,
            y: acc.y + n.position.y,
            z: acc.z + n.position.z
          }),
          { x: 0, y: 0, z: 0 }
        );
        
        center.x /= clusterNodes.length;
        center.y /= clusterNodes.length;
        center.z /= clusterNodes.length;

        // Determine cluster type based on dominant node type
        const typeCounts = clusterNodes.reduce((acc, n) => {
          acc[n.node_type] = (acc[n.node_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const dominantType = Object.entries(typeCounts)
          .sort(([,a], [,b]) => b - a)[0][0];

        clusters.push({
          id: `cluster_${clusters.length}`,
          nodes: clusterNodes.map(n => n.id),
          center,
          color: getNodeColor(dominantType, 'working', 0.3),
          label: `${dominantType.charAt(0).toUpperCase() + dominantType.slice(1)} Cluster`,
          density: clusterNodes.length / (Math.PI * eps * eps * eps * 4/3)
        });
      }
    });

    setClusters(clusters);
    console.log(`🧮 Generated ${clusters.length} clusters`);
  }, [nodes, getNodeColor]);

  // Timeline control
  const updateTimeline = useCallback((newTime: Date) => {
    setTimeline(prev => ({ ...prev, currentTime: newTime }));
    loadGraphData({ start: timeline.startTime, end: newTime });
  }, [timeline.startTime, loadGraphData]);

  const playTimeline = useCallback(() => {
    setTimeline(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  // Initialize and update effects
  useEffect(() => {
    if (user) {
      loadGraphData();
    }
  }, [user, loadGraphData]);

  useEffect(() => {
    if (nodes.length > 0) {
      runPhysicsSimulation();
      generateClusters();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes.length, runPhysicsSimulation, generateClusters]);

  useEffect(() => {
    if (searchQuery) {
      const debounceTimeout = setTimeout(() => {
        searchNodes(searchQuery);
      }, 300);
      return () => clearTimeout(debounceTimeout);
    } else {
      setFilteredNodes(new Set());
    }
  }, [searchQuery, searchNodes]);

  return {
    // Data
    nodes,
    edges,
    clusters,
    isLoading,
    
    // Selection state
    selectedNode,
    setSelectedNode,
    hoveredNode,
    setHoveredNode,
    
    // Search
    searchQuery,
    setSearchQuery,
    filteredNodes,
    
    // Timeline
    timeline,
    updateTimeline,
    playTimeline,
    
    // Actions
    loadGraphData,
    generateClusters,
    
    // Utils
    getNodeColor
  };
}

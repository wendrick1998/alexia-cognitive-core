
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { GraphNode3D, GraphEdge3D, GraphCluster } from '@/hooks/useKnowledgeGraph3D';

interface Node3DProps {
  node: GraphNode3D;
  isSelected: boolean;
  isHovered: boolean;
  isFiltered: boolean;
  onSelect: (nodeId: string) => void;
  onHover: (nodeId: string | null) => void;
}

const Node3D: React.FC<Node3DProps> = ({ 
  node, 
  isSelected, 
  isHovered, 
  isFiltered, 
  onSelect, 
  onHover 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Update position
      meshRef.current.position.set(node.position.x, node.position.y, node.position.z);
      
      // Gentle floating animation
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y += Math.sin(time + node.id.length) * 0.1;
      
      // Scale animation for selected/hovered nodes
      const targetScale = isSelected ? 1.5 : isHovered || hovered ? 1.2 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const opacity = isFiltered && !isSelected && !isHovered ? 0.3 : 1.0;

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={() => onSelect(node.id)}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(node.id);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
      >
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshStandardMaterial 
          color={node.color}
          transparent 
          opacity={opacity}
          emissive={isSelected ? node.color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {(isHovered || hovered) && (
        <Text
          position={[node.position.x, node.position.y + node.size + 1, node.position.z]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={10}
        >
          {node.title || node.content.substring(0, 50) + '...'}
        </Text>
      )}
    </group>
  );
};

interface Edge3DProps {
  edge: GraphEdge3D;
  nodes: GraphNode3D[];
  isVisible: boolean;
}

const Edge3D: React.FC<Edge3DProps> = ({ edge, nodes, isVisible }) => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  if (!sourceNode || !targetNode || !isVisible) return null;

  const points = [
    new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z),
    new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
  ];

  return (
    <Line
      points={points}
      color={`rgba(255, 255, 255, ${edge.strength * 0.5})`}
      lineWidth={edge.width}
    />
  );
};

interface Cluster3DProps {
  cluster: GraphCluster;
  isVisible: boolean;
}

const Cluster3D: React.FC<Cluster3DProps> = ({ cluster, isVisible }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[cluster.center.x, cluster.center.y, cluster.center.z]}
      >
        <sphereGeometry args={[cluster.nodes.length * 0.5, 8, 8]} />
        <meshBasicMaterial 
          color={cluster.color}
          transparent 
          opacity={0.1}
          wireframe
        />
      </mesh>
      
      <Text
        position={[cluster.center.x, cluster.center.y + cluster.nodes.length * 0.7, cluster.center.z]}
        fontSize={0.3}
        color={cluster.color}
        anchorX="center"
        anchorY="middle"
      >
        {cluster.label}
      </Text>
    </group>
  );
};

interface CameraControllerProps {
  selectedNodeId: string | null;
  nodes: GraphNode3D[];
}

const CameraController: React.FC<CameraControllerProps> = ({ selectedNodeId, nodes }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find(n => n.id === selectedNodeId);
      if (selectedNode) {
        // Smoothly move camera to focus on selected node
        const targetPosition = new THREE.Vector3(
          selectedNode.position.x + 10,
          selectedNode.position.y + 5,
          selectedNode.position.z + 10
        );
        
        // Simple camera animation (in a real implementation, you'd use gsap or similar)
        const startPosition = camera.position.clone();
        let progress = 0;
        
        const animate = () => {
          progress += 0.02;
          if (progress <= 1) {
            camera.position.lerpVectors(startPosition, targetPosition, progress);
            camera.lookAt(selectedNode.position.x, selectedNode.position.y, selectedNode.position.z);
            requestAnimationFrame(animate);
          }
        };
        animate();
      }
    }
  }, [selectedNodeId, nodes, camera]);

  return null;
};

interface KnowledgeGraph3DCanvasProps {
  nodes: GraphNode3D[];
  edges: GraphEdge3D[];
  clusters: GraphCluster[];
  selectedNode: string | null;
  hoveredNode: string | null;
  filteredNodes: Set<string>;
  showClusters: boolean;
  showEdges: boolean;
  onNodeSelect: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

const KnowledgeGraph3DCanvas: React.FC<KnowledgeGraph3DCanvasProps> = ({
  nodes,
  edges,
  clusters,
  selectedNode,
  hoveredNode,
  filteredNodes,
  showClusters,
  showEdges,
  onNodeSelect,
  onNodeHover
}) => {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [20, 20, 20], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.8}
          rotateSpeed={0.4}
        />
        
        {/* Camera Controller */}
        <CameraController selectedNodeId={selectedNode} nodes={nodes} />
        
        {/* Nodes */}
        {nodes.map(node => (
          <Node3D
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            isHovered={hoveredNode === node.id}
            isFiltered={filteredNodes.size > 0 && !filteredNodes.has(node.id)}
            onSelect={onNodeSelect}
            onHover={onNodeHover}
          />
        ))}
        
        {/* Edges */}
        {showEdges && edges.map(edge => (
          <Edge3D
            key={edge.id}
            edge={edge}
            nodes={nodes}
            isVisible={filteredNodes.size === 0 || 
              (filteredNodes.has(edge.source) && filteredNodes.has(edge.target))}
          />
        ))}
        
        {/* Clusters */}
        {showClusters && clusters.map(cluster => (
          <Cluster3D
            key={cluster.id}
            cluster={cluster}
            isVisible={true}
          />
        ))}
        
        {/* Grid helper */}
        <gridHelper args={[100, 100, '#333333', '#333333']} />
      </Canvas>
    </div>
  );
};

export default KnowledgeGraph3DCanvas;

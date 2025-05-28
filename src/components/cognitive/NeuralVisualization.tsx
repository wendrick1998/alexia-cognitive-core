
import React, { useEffect, useRef, useState } from 'react';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Network, Activity } from 'lucide-react';

interface NeuralVisualizationProps {
  className?: string;
}

const NeuralVisualization: React.FC<NeuralVisualizationProps> = ({ className }) => {
  const neural = useNeuralSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [networkData, setNetworkData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });

  // Load network topology
  useEffect(() => {
    const loadNetwork = async () => {
      const data = await neural.getNetworkTopology();
      setNetworkData(data);
    };

    loadNetwork();
  }, [neural]);

  // Simple 2D neural network visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || networkData.nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw connections first
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    networkData.edges.forEach(edge => {
      const sourceNode = networkData.nodes.find(n => n.id === edge.source);
      const targetNode = networkData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        // Simple layout - nodes in a circle
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
      
      // Node size based on activation
      const nodeRadius = 5 + (node.activation_strength || 0.1) * 15;
      
      // Color based on activation level
      const activation = node.activation_strength || 0.1;
      if (activation > 0.7) {
        ctx.fillStyle = '#ef4444'; // High activation - red
      } else if (activation > 0.4) {
        ctx.fillStyle = '#f59e0b'; // Medium activation - orange
      } else if (activation > 0.1) {
        ctx.fillStyle = '#10b981'; // Low activation - green
      } else {
        ctx.fillStyle = '#6b7280'; // Dormant - gray
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
  }, [networkData, selectedNode]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node (simplified hit detection)
    networkData.nodes.forEach((node, index) => {
      const angle = (index / networkData.nodes.length) * 2 * Math.PI;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;
      const nodeX = canvas.width / 2 + Math.cos(angle) * radius;
      const nodeY = canvas.height / 2 + Math.sin(angle) * radius;
      const nodeRadius = 5 + (node.activation_strength || 0.1) * 15;
      
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance <= nodeRadius) {
        setSelectedNode(node.id);
        neural.accessNode(node.id, 0.2); // Boost activation on click
      }
    });
  };

  const triggerSpreadActivation = async () => {
    if (selectedNode) {
      await neural.spreadActivation(selectedNode, 0.5, 3);
      // Reload network data to show updated activations
      const data = await neural.getNetworkTopology();
      setNetworkData(data);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Rede Neural Cognitiva
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {networkData.nodes.length} nós
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
            
            {selectedNode && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={triggerSpreadActivation}
                  disabled={neural.isProcessing}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Propagar Ativação
                </Button>
                <span className="text-sm text-gray-600">
                  Nó selecionado: {selectedNode.substring(0, 8)}...
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Padrões de Ativação
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
    </div>
  );
};

export default NeuralVisualization;

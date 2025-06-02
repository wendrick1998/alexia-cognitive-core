
import React, { useState, useEffect, useCallback } from 'react';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Network, Activity, Clock, TrendingUp } from 'lucide-react';

const NeuralVisualization: React.FC = () => {
  const {
    activationPatterns,
    memoryConsolidations,
    primingContexts,
    isProcessing,
    loadActivationPatterns,
    consolidateMemory
  } = useNeuralSystem();

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Simulate neural activity visualization
  const renderActivationHeatmap = useCallback(() => {
    const maxActivation = Math.max(...activationPatterns.map(p => p.activation_strength), 1);
    
    return (
      <div className="grid grid-cols-8 gap-1 p-4">
        {activationPatterns.slice(0, 32).map((pattern, index) => {
          const intensity = (pattern.activation_strength / maxActivation) * 100;
          const hue = Math.floor(intensity * 1.2); // Color from red to green
          
          return (
            <div
              key={pattern.node_id}
              className={`w-8 h-8 rounded cursor-pointer transition-all duration-300 ${
                selectedPattern === pattern.node_id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                backgroundColor: `hsl(${hue}, 70%, ${Math.max(30, intensity)}%)`,
                opacity: 0.3 + (intensity / 100) * 0.7
              }}
              onClick={() => setSelectedPattern(
                selectedPattern === pattern.node_id ? null : pattern.node_id
              )}
              title={`Activation: ${(pattern.activation_strength * 100).toFixed(1)}%`}
            />
          );
        })}
      </div>
    );
  }, [activationPatterns, selectedPattern]);

  const renderConnectionGraph = useCallback(() => {
    if (activationPatterns.length === 0) return null;

    return (
      <div className="relative w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
        <svg className="w-full h-full">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Neural nodes */}
          {activationPatterns.slice(0, 12).map((pattern, index) => {
            const x = 50 + (index % 4) * 60;
            const y = 50 + Math.floor(index / 4) * 60;
            const radius = 8 + (pattern.activation_strength * 12);
            
            return (
              <g key={pattern.node_id}>
                {/* Connections */}
                {activationPatterns.slice(0, 12).map((targetPattern, targetIndex) => {
                  if (targetIndex <= index) return null;
                  
                  const targetX = 50 + (targetIndex % 4) * 60;
                  const targetY = 50 + Math.floor(targetIndex / 4) * 60;
                  const connectionStrength = Math.random() * 0.5 + 0.1;
                  
                  return (
                    <line
                      key={`${pattern.node_id}-${targetPattern.node_id}`}
                      x1={x}
                      y1={y}
                      x2={targetX}
                      y2={targetY}
                      stroke="#3b82f6"
                      strokeWidth={connectionStrength * 3}
                      opacity={connectionStrength}
                      className="animate-pulse"
                    />
                  );
                })}
                
                {/* Node */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={`hsl(${pattern.activation_strength * 120}, 70%, 60%)`}
                  stroke="#1f2937"
                  strokeWidth="2"
                  className={`transition-all duration-300 ${
                    selectedPattern === pattern.node_id ? 'drop-shadow-lg' : ''
                  }`}
                  style={{
                    animation: `pulse ${2 / animationSpeed}s infinite`
                  }}
                  onClick={() => setSelectedPattern(
                    selectedPattern === pattern.node_id ? null : pattern.node_id
                  )}
                />
                
                {/* Activation indicator */}
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  fontWeight="bold"
                >
                  {Math.round(pattern.activation_strength * 100)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }, [activationPatterns, selectedPattern, animationSpeed]);

  const renderPrimingContexts = useCallback(() => {
    return (
      <div className="space-y-3">
        {primingContexts.map((context, index) => (
          <Card key={index} className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium capitalize">
                  {context.context_type.replace('_', ' ')} Context
                </CardTitle>
                <Badge variant="secondary">
                  {(context.strength * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">
                  {context.nodes.length} nodes
                </span>
              </div>
              <Progress value={context.strength * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                Last updated: {new Date(context.last_update).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [primingContexts]);

  const renderConsolidationHistory = useCallback(() => {
    return (
      <div className="space-y-2">
        {memoryConsolidations.slice(0, 5).map((consolidation) => (
          <Card key={consolidation.id} className="border border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium capitalize">
                    {consolidation.session_type}
                  </span>
                </div>
                <Badge variant={
                  consolidation.consolidation_quality > 0.8 ? "default" : 
                  consolidation.consolidation_quality > 0.6 ? "secondary" : "destructive"
                }>
                  {(consolidation.consolidation_quality * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{consolidation.nodes_processed} nodes processed</span>
                <span>{new Date(consolidation.completed_at).toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [memoryConsolidations]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Neural System Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={loadActivationPatterns}
              disabled={isProcessing}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Refresh Patterns
            </Button>
            
            <Button
              onClick={() => consolidateMemory('manual')}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              Consolidate Memory
            </Button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Animation Speed:</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600">{animationSpeed}x</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activation Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Neural Activation Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activationPatterns.length > 0 ? (
            renderActivationHeatmap()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activation patterns available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Neural Network Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderConnectionGraph()}
        </CardContent>
      </Card>

      {/* Priming Contexts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Priming Contexts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primingContexts.length > 0 ? (
            renderPrimingContexts()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No priming contexts available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Consolidation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Memory Consolidation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memoryConsolidations.length > 0 ? (
            renderConsolidationHistory()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No consolidation history</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Pattern Details */}
      {selectedPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Pattern Details: {selectedPattern.substring(0, 8)}...
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const pattern = activationPatterns.find(p => p.node_id === selectedPattern);
              if (!pattern) return null;
              
              return (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Activation Strength:</span>
                    <span className="font-mono">{(pattern.activation_strength * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Propagation Depth:</span>
                    <span className="font-mono">{pattern.propagation_depth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected Nodes:</span>
                    <span className="font-mono">{pattern.connected_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Boost:</span>
                    <span className="font-mono">{new Date(pattern.last_boost).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NeuralVisualization;

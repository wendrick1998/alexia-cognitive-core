
import React, { useState, useEffect } from 'react';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { Brain, Clock, Zap, TrendingUp, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const MemoryConsolidationPanel: React.FC = () => {
  const { 
    memoryConsolidations, 
    primingContexts, 
    predictiveCache,
    consolidateMemories,
    isProcessing 
  } = useNeuralSystem();

  const [timeWindow, setTimeWindow] = useState([24]);
  const [minClusterSize, setMinClusterSize] = useState([3]);
  const [autoConsolidate, setAutoConsolidate] = useState(true);

  // Auto-consolidation every 30 minutes
  useEffect(() => {
    if (!autoConsolidate) return;

    const interval = setInterval(() => {
      consolidateMemories(timeWindow[0], minClusterSize[0]);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoConsolidate, timeWindow, minClusterSize, consolidateMemories]);

  const handleManualConsolidation = () => {
    consolidateMemories(timeWindow[0], minClusterSize[0]);
  };

  const formatPatternType = (type: string) => {
    const types = {
      'temporal': 'Temporal',
      'semantic': 'Semântico', 
      'contextual': 'Contextual',
      'behavioral': 'Comportamental'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPatternColor = (type: string) => {
    const colors = {
      'temporal': 'bg-blue-100 text-blue-800',
      'semantic': 'bg-green-100 text-green-800',
      'contextual': 'bg-purple-100 text-purple-800',
      'behavioral': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Memory Consolidation & Priming</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoConsolidate ? "default" : "secondary"}>
            Auto: {autoConsolidate ? "ON" : "OFF"}
          </Badge>
          <Button
            onClick={() => setAutoConsolidate(!autoConsolidate)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Configuração de Consolidação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Janela Temporal (horas): {timeWindow[0]}</Label>
            <Slider
              value={timeWindow}
              onValueChange={setTimeWindow}
              max={168}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Tamanho Mínimo do Cluster: {minClusterSize[0]}</Label>
            <Slider
              value={minClusterSize}
              onValueChange={setMinClusterSize}
              max={10}
              min={2}
              step={1}
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleManualConsolidation}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Consolidando...' : 'Consolidar Memórias'}
          </Button>
        </CardContent>
      </Card>

      {/* Memory Consolidations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Consolidações de Memória ({memoryConsolidations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memoryConsolidations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma consolidação de memória encontrada</p>
              <p className="text-sm">Execute uma consolidação para ver os padrões</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memoryConsolidations.map((consolidation) => (
                <div 
                  key={consolidation.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getPatternColor(consolidation.pattern_type)}>
                      {formatPatternType(consolidation.pattern_type)}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <TrendingUp className="w-4 h-4" />
                      Score: {consolidation.consolidation_score.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {consolidation.consolidated_nodes.length} nós consolidados
                  </p>
                  <div className="text-xs text-gray-500">
                    {new Date(consolidation.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priming Contexts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Contextos de Priming ({primingContexts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primingContexts.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum contexto de priming ativo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {primingContexts.map((context) => (
                <div 
                  key={context.context_id}
                  className="p-3 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {context.primed_nodes.length} nós primados
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Força: {(context.priming_strength * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Padrões: {context.trigger_patterns.slice(0, 3).join(', ')}
                    {context.trigger_patterns.length > 3 && '...'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictive Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cache Preditivo ({predictiveCache.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {predictiveCache.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Cache preditivo vazio</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictiveCache
                .sort((a, b) => b.hit_count - a.hit_count)
                .slice(0, 10)
                .map((cache, index) => (
                <div 
                  key={cache.query_pattern}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">
                      {cache.query_pattern.replace(/_/g, ' ')}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Hits: {cache.hit_count}</span>
                      <span>Conf: {(cache.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {cache.predicted_nodes.length} nós preditos | 
                    Último uso: {new Date(cache.last_used).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryConsolidationPanel;

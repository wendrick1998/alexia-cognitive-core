
import React, { useState } from 'react';
import { useCognitiveGraph3 } from '@/hooks/useCognitiveGraph3';
import { Brain, Layers, Zap, TrendingUp, BarChart3, Clock, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const CognitiveGraph3Panel: React.FC = () => {
  const {
    clusters,
    consolidationSessions,
    shortTermBuffer,
    evolutionStats,
    isProcessing,
    consolidateMemory,
    discoverClusters,
    loadEvolutionStats
  } = useCognitiveGraph3();

  const [consolidationHours, setConsolidationHours] = useState([6]);
  const [clusterMinSize, setClusterMinSize] = useState([3]);
  const [similarityThreshold, setSimilarityThreshold] = useState([0.8]);

  const handleConsolidateMemory = async () => {
    await consolidateMemory(consolidationHours[0]);
  };

  const handleDiscoverClusters = async () => {
    await discoverClusters(clusterMinSize[0], similarityThreshold[0]);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getClusterTypeColor = (type: string) => {
    const colors = {
      'semantic': 'bg-blue-100 text-blue-800',
      'temporal': 'bg-green-100 text-green-800',
      'contextual': 'bg-purple-100 text-purple-800',
      'behavioral': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Evolution Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Cognitive Graph 3.0 - Arquitetura Neural Avançada
            </CardTitle>
            <Button 
              onClick={loadEvolutionStats}
              variant="outline"
              size="sm"
            >
              Atualizar Stats
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {evolutionStats && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {evolutionStats.total_nodes}
                </div>
                <div className="text-sm text-gray-600">Nós Totais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {evolutionStats.long_term_memories}
                </div>
                <div className="text-sm text-gray-600">Memórias LTM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(evolutionStats.avg_activation * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Ativação Média</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {evolutionStats.concept_diversity}
                </div>
                <div className="text-sm text-gray-600">Diversidade</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="consolidation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consolidation">Consolidação</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="buffer">Buffer STM</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Memory Consolidation Tab */}
        <TabsContent value="consolidation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Memory Consolidation System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Janela Temporal (horas): {consolidationHours[0]}</Label>
                <Slider
                  value={consolidationHours}
                  onValueChange={setConsolidationHours}
                  max={24}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={handleConsolidateMemory}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Consolidando...' : 'Executar Consolidação'}
              </Button>

              <div className="space-y-3">
                <h4 className="font-medium">Sessões Recentes ({consolidationSessions.length})</h4>
                {consolidationSessions.map((session) => (
                  <div key={session.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {session.session_type}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Qualidade: {(session.consolidation_quality * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Nós processados: {session.nodes_processed}</div>
                      <div>Conexões reforçadas: {session.connections_strengthened}</div>
                      <div>Padrões descobertos: {session.patterns_discovered}</div>
                      <div className="text-gray-500">
                        {formatDateTime(session.started_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognitive Clusters Tab */}
        <TabsContent value="clusters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Cognitive Clusters Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tamanho Mínimo: {clusterMinSize[0]}</Label>
                  <Slider
                    value={clusterMinSize}
                    onValueChange={setClusterMinSize}
                    max={10}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Similaridade: {similarityThreshold[0]}</Label>
                  <Slider
                    value={similarityThreshold}
                    onValueChange={setSimilarityThreshold}
                    max={1}
                    min={0.5}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>

              <Button 
                onClick={handleDiscoverClusters}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Descobrindo...' : 'Descobrir Clusters'}
              </Button>

              <div className="space-y-3">
                <h4 className="font-medium">Clusters Descobertos ({clusters.length})</h4>
                {clusters.map((cluster) => (
                  <div key={cluster.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getClusterTypeColor(cluster.cluster_type)}>
                        {cluster.cluster_type}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {cluster.member_nodes.length} nós
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Densidade: {(cluster.density_score * 100).toFixed(1)}%</div>
                      <div>Coerência: {(cluster.coherence_score * 100).toFixed(1)}%</div>
                      <div>Estabilidade: {(cluster.temporal_stability * 100).toFixed(1)}%</div>
                      <div className="text-gray-500">
                        Método: {cluster.discovery_method} | {formatDateTime(cluster.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Short-Term Memory Buffer Tab */}
        <TabsContent value="buffer" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Short-Term Memory Buffer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Buffer Ativo ({shortTermBuffer.length}/100)</h4>
                  <div className="text-sm text-gray-500">
                    Últimas interações
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {shortTermBuffer.map((memory) => (
                    <div key={memory.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          Pos: {memory.buffer_position}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Importância: {(memory.importance_score * 100).toFixed(0)}%</span>
                          <span>Valência: {memory.emotional_valence.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">
                          {memory.interaction_data.type || 'interaction'}
                        </div>
                        <div className="text-gray-600 truncate">
                          {memory.interaction_data.content?.substring(0, 100)}...
                        </div>
                        <div className="text-gray-500 mt-1">
                          {formatDateTime(memory.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Memory Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evolutionStats && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Working Memory</span>
                      <span className="text-sm font-medium">
                        {evolutionStats.total_nodes - evolutionStats.long_term_memories}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Long-term Memory</span>
                      <span className="text-sm font-medium">
                        {evolutionStats.long_term_memories}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recent Activity (7d)</span>
                      <span className="text-sm font-medium">
                        {evolutionStats.recent_nodes}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Network className="w-4 h-4" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Clusters Ativos</span>
                    <span className="text-sm font-medium">{clusters.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Buffer STM</span>
                    <span className="text-sm font-medium">{shortTermBuffer.length}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Consolidações</span>
                    <span className="text-sm font-medium">{consolidationSessions.length}</span>
                  </div>
                  {evolutionStats && (
                    <div className="flex justify-between">
                      <span className="text-sm">Score Médio</span>
                      <span className="text-sm font-medium">
                        {(evolutionStats.avg_consolidation * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CognitiveGraph3Panel;

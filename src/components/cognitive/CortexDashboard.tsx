
import { useState } from 'react';
import { useCortexLogs } from '@/hooks/useCortexLogs';
import { useCognitiveNodes } from '@/hooks/useCognitiveNodes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Cpu, Activity, Zap, Clock, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CortexDashboard = () => {
  const { logs, loading: logsLoading, clearLogs } = useCortexLogs();
  const { nodes, loading: nodesLoading } = useCognitiveNodes();
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const getModelIcon = (model: string) => {
    if (model.includes('gpt')) return <Brain className="w-4 h-4" />;
    if (model.includes('claude')) return <Cpu className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getDecisionTypeColor = (fallbackUsed: boolean) => {
    return fallbackUsed 
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const recentLogs = logs.slice(0, 10);
  const activeNodes = nodes.filter(node => node.activation_strength > 0.5);
  const totalDecisions = logs.length;
  const fallbackRate = logs.filter(log => log.fallback_used).length / Math.max(totalDecisions, 1);
  const avgExecutionTime = logs.reduce((acc, log) => acc + log.execution_time_ms, 0) / Math.max(totalDecisions, 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Córtex Dashboard</h1>
          <p className="text-white/70">Auditoria completa do sistema cognitivo Alex IA</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={clearLogs}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            Limpar Logs
          </Button>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {totalDecisions} decisões registradas
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Decisões Totais</p>
                <p className="text-white text-2xl font-bold">{totalDecisions}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Nós Ativos</p>
                <p className="text-green-400 text-2xl font-bold">{activeNodes.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Taxa de Fallback</p>
                <p className="text-yellow-400 text-2xl font-bold">
                  {(fallbackRate * 100).toFixed(1)}%
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Tempo Médio</p>
                <p className="text-purple-400 text-2xl font-bold">
                  {formatExecutionTime(avgExecutionTime)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="decisions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
          <TabsTrigger value="decisions" className="data-[state=active]:bg-blue-500/20">
            Decisões do Córtex
          </TabsTrigger>
          <TabsTrigger value="network" className="data-[state=active]:bg-purple-500/20">
            Rede Neural Ativa
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-green-500/20">
            Insights Gerados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions" className="space-y-4">
          <Card className="bg-gray-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Log de Decisões em Tempo Real</CardTitle>
              <CardDescription className="text-white/60">
                Acompanhe como a Alex IA toma decisões e processa informações
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white/70">Solicitação</TableHead>
                        <TableHead className="text-white/70">Modelo</TableHead>
                        <TableHead className="text-white/70">Status</TableHead>
                        <TableHead className="text-white/70">Tempo</TableHead>
                        <TableHead className="text-white/70">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLogs.map((log) => (
                        <TableRow 
                          key={log.id} 
                          className="border-white/10 hover:bg-white/5 cursor-pointer"
                          onClick={() => setSelectedLog(log)}
                        >
                          <TableCell className="text-white max-w-xs truncate">
                            {log.user_request}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getModelIcon(log.selected_model)}
                              <span className="text-white/80">{log.selected_model}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getDecisionTypeColor(log.fallback_used)}>
                              {log.fallback_used ? 'Fallback' : 'Principal'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/60">
                            {formatExecutionTime(log.execution_time_ms)}
                          </TableCell>
                          <TableCell className="text-white/60">
                            {formatDistanceToNow(new Date(log.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card className="bg-gray-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Rede de Nós Cognitivos Ativos</CardTitle>
              <CardDescription className="text-white/60">
                Visualização dos nós com maior ativação no momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nodesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeNodes.slice(0, 6).map((node) => (
                    <div 
                      key={node.id}
                      className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {node.node_type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-white/60">
                            {(node.activation_strength * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <h4 className="text-white font-medium text-sm mb-1">{node.title}</h4>
                      <p className="text-white/60 text-xs line-clamp-2">{node.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="bg-gray-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Insights Gerados por Decisão</CardTitle>
              <CardDescription className="text-white/60">
                Insights automáticos criados durante o processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs
                  .filter(log => log.insights_generated && log.insights_generated.length > 0)
                  .slice(0, 5)
                  .map((log) => (
                    <div key={log.id} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">
                          {log.insights_generated.length} insights gerados
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">{log.reasoning}</p>
                      <p className="text-white/60 text-xs mt-1">
                        Para: "{log.user_request.substring(0, 80)}..."
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Detalhes da Decisão</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Solicitação do Usuário:</h4>
                <p className="text-white/80 bg-gray-800 p-3 rounded">{selectedLog.user_request}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-medium mb-1">Modelo Selecionado:</h4>
                  <p className="text-blue-400">{selectedLog.selected_model}</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Tempo de Execução:</h4>
                  <p className="text-purple-400">{formatExecutionTime(selectedLog.execution_time_ms)}</p>
                </div>
              </div>

              {selectedLog.reasoning && (
                <div>
                  <h4 className="text-white font-medium mb-2">Raciocínio da Decisão:</h4>
                  <p className="text-white/80 bg-gray-800 p-3 rounded">{selectedLog.reasoning}</p>
                </div>
              )}

              {selectedLog.fallback_used && (
                <div>
                  <h4 className="text-white font-medium mb-2">Motivo do Fallback:</h4>
                  <p className="text-yellow-400 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                    {selectedLog.fallback_reason}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-white font-medium mb-2">Nós Ativados:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLog.activated_nodes?.map((nodeId: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      Nó {idx + 1}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CortexDashboard;

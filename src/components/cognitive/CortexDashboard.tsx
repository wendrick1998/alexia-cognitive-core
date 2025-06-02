
import { useCortexLogs } from '@/hooks/useCortexLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Cpu, Network, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CortexDashboard = () => {
  const { logs, loading, loadLogs, clearLogs } = useCortexLogs();

  const getModelColor = (model: string) => {
    if (model.includes('gpt-4')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (model.includes('gpt-3.5')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (model.includes('claude')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const avgExecutionTime = logs.length > 0 
    ? Math.round(logs.reduce((acc, log) => acc + log.execution_time_ms, 0) / logs.length)
    : 0;

  const fallbackRate = logs.length > 0
    ? Math.round((logs.filter(log => log.fallback_used).length / logs.length) * 100)
    : 0;

  const modelsUsed = [...new Set(logs.map(log => log.selected_model))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Córtex Prefrontal</h1>
          <p className="text-white/70">Auditoria completa das decisões e processos cognitivos</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadLogs}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={clearLogs}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Logs
          </Button>
        </div>
      </div>

      {/* Métricas do Córtex */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Decisões Processadas</p>
                <p className="text-white text-2xl font-bold">{logs.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Tempo Médio</p>
                <p className="text-white text-2xl font-bold">{avgExecutionTime}ms</p>
              </div>
              <Cpu className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Taxa de Fallback</p>
                <p className="text-white text-2xl font-bold">{fallbackRate}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Modelos Utilizados</p>
                <p className="text-white text-2xl font-bold">{modelsUsed.length}</p>
              </div>
              <Network className="w-8 h-8 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log de Decisões */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Log de Decisões do Córtex
          </CardTitle>
          <CardDescription className="text-white/60">
            Registro detalhado das decisões tomadas pela Alex IA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-white text-xl mb-2">Nenhum Log de Decisão</h3>
              <p className="text-white/60">
                Inicie uma conversa com Alex IA para ver as decisões do córtex
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Solicitação do Usuário</TableHead>
                    <TableHead className="text-white/70">Modelo Selecionado</TableHead>
                    <TableHead className="text-white/70">Raciocínio</TableHead>
                    <TableHead className="text-white/70">Tempo</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="max-w-xs">
                        <div className="text-white text-sm">
                          {log.user_request.substring(0, 80)}
                          {log.user_request.length > 80 && '...'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getModelColor(log.selected_model)}>
                          {log.selected_model}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-white/60 text-sm">
                          {log.reasoning ? (
                            <>
                              {log.reasoning.substring(0, 60)}
                              {log.reasoning.length > 60 && '...'}
                            </>
                          ) : (
                            'Seleção automática'
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60">
                        {log.execution_time_ms}ms
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.fallback_used ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          <span className="text-white/60 text-sm">
                            {log.fallback_used ? 'Fallback' : 'Sucesso'}
                          </span>
                        </div>
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

      {/* Rede de Nós Ativados */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="w-5 h-5" />
            Rede de Nós Ativados
          </CardTitle>
          <CardDescription className="text-white/60">
            Visualização dos nós cognitivos ativados nas últimas decisões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">
                    Sessão: {log.session_id || 'N/A'}
                  </div>
                  <div className="text-white/60 text-sm">
                    {formatDistanceToNow(new Date(log.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
                <div className="text-white/80 text-sm mb-3">
                  {log.user_request.substring(0, 100)}...
                </div>
                <div className="flex flex-wrap gap-2">
                  {log.activated_nodes.length > 0 ? (
                    log.activated_nodes.map((nodeId, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-blue-500/20 text-blue-400">
                        Nó {String(nodeId).substring(0, 8)}...
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs bg-gray-500/20 text-gray-400">
                      Nenhum nó ativado
                    </Badge>
                  )}
                </div>
                {log.insights_generated.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-1">Insights Gerados:</div>
                    <div className="flex flex-wrap gap-1">
                      {log.insights_generated.map((insight, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400">
                          {String(insight).substring(0, 20)}...
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CortexDashboard;


import { useState } from 'react';
import { useCognitiveNodes } from '@/hooks/useCognitiveNodes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, Zap, Eye, Clock, Activity, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CognitiveGraphPage = () => {
  const { nodes, loading, activateNode } = useCognitiveNodes();
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'thought': return <Brain className="w-4 h-4" />;
      case 'memory': return <Clock className="w-4 h-4" />;
      case 'insight': return <Zap className="w-4 h-4" />;
      case 'decision': return <Target className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivationColor = (strength: number) => {
    if (strength >= 0.8) return 'bg-red-500';
    if (strength >= 0.6) return 'bg-orange-500';
    if (strength >= 0.4) return 'bg-yellow-500';
    if (strength >= 0.2) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Grafo Cognitivo</h1>
          <p className="text-white/70">Visualização dos nós cognitivos gerados pela Alex IA</p>
        </div>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
          {nodes.length} nós ativos
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <Card key={node.id} className="bg-gray-900/50 border-white/10 hover:border-blue-500/30 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getNodeTypeIcon(node.node_type)}
                    <CardTitle className="text-white text-sm">{node.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${getActivationColor(node.activation_strength)}`}
                      title={`Ativação: ${(node.activation_strength * 100).toFixed(0)}%`}
                    />
                    <Badge variant="outline" className="text-xs">
                      {node.node_type}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-white/60 text-sm">
                  {node.content.substring(0, 100)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Ativação: {(node.activation_strength * 100).toFixed(0)}%</span>
                    <span>Acessos: {node.access_count}</span>
                  </div>
                  <div className="text-xs text-white/50">
                    Última ativação: {formatDistanceToNow(new Date(node.last_accessed_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedNode(node)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Visualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-white flex items-center gap-2">
                            {getNodeTypeIcon(node.node_type)}
                            {node.title}
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            {node.node_type} • Criado em {new Date(node.created_at).toLocaleDateString('pt-BR')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-white font-medium mb-2">Conteúdo</h4>
                            <p className="text-gray-300 whitespace-pre-wrap">{node.content}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Força de Ativação:</span>
                              <div className="text-white">{(node.activation_strength * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-white/60">Score de Relevância:</span>
                              <div className="text-white">{(node.relevance_score * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-white/60">Contagem de Acesso:</span>
                              <div className="text-white">{node.access_count}</div>
                            </div>
                            <div>
                              <span className="text-white/60">Tipo de Memória:</span>
                              <div className="text-white">{node.memory_type}</div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => activateNode(node.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Ativar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {nodes.length === 0 && !loading && (
        <Card className="bg-gray-900/50 border-white/10 text-center py-12">
          <CardContent>
            <Brain className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">Nenhum Nó Cognitivo Encontrado</h3>
            <p className="text-white/60">
              Inicie uma conversa com Alex IA para começar a gerar nós cognitivos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CognitiveGraphPage;

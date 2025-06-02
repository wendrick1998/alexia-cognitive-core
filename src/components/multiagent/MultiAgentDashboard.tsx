
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  Users,
  Activity,
  Lightbulb,
  Target,
  Eye,
  Layers,
  Network,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useBlackboardSystem } from '@/hooks/useBlackboardSystem';
import { useToast } from '@/hooks/use-toast';

const MultiAgentDashboard = () => {
  const { toast } = useToast();
  const {
    blackboard,
    processWithBlackboard,
    getBlackboardStatus,
    initializeKnowledgeSources,
    isInitialized
  } = useBlackboardSystem();

  const [processing, setProcessing] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  // Initialize system on mount
  useEffect(() => {
    initializeKnowledgeSources();
  }, [initializeKnowledgeSources]);

  const handleTestProcessing = async () => {
    if (!testInput.trim()) {
      toast({
        title: "Input Necessário",
        description: "Digite algo para testar o sistema multiagentes",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await processWithBlackboard(testInput, {
        mode: 'test',
        timestamp: Date.now()
      });

      setLastResult(result);
      
      toast({
        title: "Processamento Concluído",
        description: `${result.partialResults?.length || 0} agentes contribuíram para a solução`,
      });
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro",
        description: "Falha no processamento multiagentes",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const status = getBlackboardStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Sistema Multiagentes</h2>
            <p className="text-white/60">Blackboard colaborativo com Web Workers</p>
          </div>
        </div>
        
        <Badge variant={isInitialized ? 'default' : 'secondary'}>
          {isInitialized ? 'Inicializado' : 'Carregando...'}
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-sm text-white/60">Agentes Ativos</div>
            <div className="text-2xl font-bold text-purple-400">{status.activeKnowledgeSources}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-sm text-white/60">Entradas Blackboard</div>
            <div className="text-2xl font-bold text-blue-400">{status.totalEntries}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className={`w-6 h-6 ${processing ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="text-sm text-white/60">Status</div>
            <div className={`font-bold ${processing ? 'text-green-400' : 'text-gray-400'}`}>
              {processing ? 'Processando' : 'Aguardando'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Network className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-sm text-white/60">Colaboração</div>
            <div className="text-2xl font-bold text-green-400">Ativa</div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Sources */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Agentes Cognitivos
          </CardTitle>
          <CardDescription className="text-white/60">
            Web Workers especializados em diferentes capacidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {status.knowledgeSources.map((ks) => (
              <div key={ks.id} className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {ks.id === 'analytical' && <Brain className="w-5 h-5 text-blue-400" />}
                    {ks.id === 'creative' && <Lightbulb className="w-5 h-5 text-yellow-400" />}
                    {ks.id === 'critical' && <Eye className="w-5 h-5 text-red-400" />}
                    {ks.id === 'integrator' && <Network className="w-5 h-5 text-green-400" />}
                    <span className="font-medium text-white">{ks.name}</span>
                  </div>
                  <Badge variant={ks.isActive ? 'default' : 'outline'}>
                    {ks.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {ks.capabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs mr-1">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Interface */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Teste do Sistema
          </CardTitle>
          <CardDescription className="text-white/60">
            Experimente o processamento colaborativo multiagentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite uma tarefa complexa para testar o sistema multiagentes..."
              className="w-full h-24 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
            />
          </div>
          <Button 
            onClick={handleTestProcessing}
            disabled={processing || !isInitialized}
            className="w-full"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Executar Processamento Multiagentes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {lastResult && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Resultado do Processamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-medium text-white mb-2">Resultado Integrado:</h4>
              <p className="text-white/80">{lastResult.result?.result}</p>
            </div>
            
            {lastResult.partialResults && lastResult.partialResults.length > 0 && (
              <div>
                <h4 className="font-medium text-white mb-3">Contribuições dos Agentes:</h4>
                <div className="space-y-3">
                  {lastResult.partialResults.map((partial: any, index: number) => (
                    <div key={index} className="p-3 bg-white/5 rounded border-l-4 border-blue-400">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{partial.result?.agent}</span>
                        <Badge variant="outline">
                          Confiança: {(partial.result?.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-white/70">{partial.result?.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Blackboard Entries */}
      {status.recentEntries.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Blackboard Recente
            </CardTitle>
            <CardDescription className="text-white/60">
              Últimas entradas no quadro colaborativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {entry.type}
                    </Badge>
                    <span className="text-sm text-white/80">{entry.source}</span>
                  </div>
                  <div className="text-xs text-white/60">
                    {(entry.confidence * 100).toFixed(0)}% confiança
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiAgentDashboard;

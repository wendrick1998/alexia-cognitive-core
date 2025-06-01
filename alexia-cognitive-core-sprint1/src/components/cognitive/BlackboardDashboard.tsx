
import React, { useState, useEffect } from 'react';
import { useBlackboardSystem } from '@/hooks/useBlackboardSystem';
import { Brain, Cpu, Zap, Clock, CheckCircle, AlertCircle, Activity, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const BlackboardDashboard: React.FC = () => {
  const { 
    blackboard, 
    processWithBlackboard, 
    getBlackboardStatus, 
    initializeKnowledgeSources,
    isInitialized 
  } = useBlackboardSystem();

  const [testInput, setTestInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    if (!isInitialized) {
      initializeKnowledgeSources();
    }
    
    const updateStatus = () => {
      setStatus(getBlackboardStatus());
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, [isInitialized, initializeKnowledgeSources, getBlackboardStatus]);

  const handleTestProcessing = async () => {
    if (!testInput.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await processWithBlackboard(
        testInput,
        { source: 'blackboard-test', timestamp: Date.now() },
        ['logical-reasoning', 'creativity', 'validation']
      );
      setLastResult(result);
    } catch (error) {
      console.error('Test processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSystemStatus = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Brain className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold">{status?.totalEntries || 0}</div>
          <div className="text-sm text-gray-600">Entradas no Blackboard</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold">{status?.activeKnowledgeSources || 0}</div>
          <div className="text-sm text-gray-600">Knowledge Sources</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold">{isInitialized ? 'ON' : 'OFF'}</div>
          <div className="text-sm text-gray-600">Sistema Ativo</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Cpu className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold">{isProcessing ? 'PROC' : 'IDLE'}</div>
          <div className="text-sm text-gray-600">Status</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderKnowledgeSources = () => (
    <div className="space-y-3">
      {status?.knowledgeSources?.map((ks: any) => (
        <Card key={ks.id} className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                {ks.id === 'analytical' && <Brain className="w-4 h-4 text-blue-600" />}
                {ks.id === 'creative' && <Zap className="w-4 h-4 text-purple-600" />}
                {ks.id === 'critical' && <AlertCircle className="w-4 h-4 text-red-600" />}
                {ks.id === 'integrator' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {ks.name}
              </h4>
              <Badge variant={ks.isActive ? "default" : "secondary"}>
                {ks.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {ks.capabilities.map((cap: string) => (
                <Badge key={cap} variant="outline" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderRecentEntries = () => (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {status?.recentEntries?.map((entry: any) => (
        <Card key={entry.id} className="border border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {entry.type}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Fonte: {entry.source} | Confiança: {(entry.confidence * 100).toFixed(0)}%
            </p>
            {entry.content?.result && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {typeof entry.content.result === 'string' 
                  ? entry.content.result.substring(0, 150) + '...'
                  : JSON.stringify(entry.content).substring(0, 150) + '...'
                }
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      {(!status?.recentEntries || status.recentEntries.length === 0) && (
        <div className="text-center text-gray-500 py-8">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma entrada recente no Blackboard</p>
        </div>
      )}
    </div>
  );

  const renderTestInterface = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Teste o sistema Blackboard com uma tarefa complexa..."
          onKeyPress={(e) => e.key === 'Enter' && handleTestProcessing()}
        />
        <Button 
          onClick={handleTestProcessing}
          disabled={isProcessing || !testInput.trim() || !isInitialized}
        >
          {isProcessing ? <Cpu className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        </Button>
      </div>

      {lastResult && (
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Resultado do Processamento Paralelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge variant={lastResult.success ? "default" : "destructive"}>
                  {lastResult.success ? "Sucesso" : "Falha"}
                </Badge>
                <span className="ml-2 text-sm text-gray-600">
                  Task ID: {lastResult.taskId}
                </span>
              </div>
              
              {lastResult.result && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium mb-2">Resultado Integrado:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {typeof lastResult.result.result === 'string' 
                      ? lastResult.result.result 
                      : JSON.stringify(lastResult.result, null, 2)
                    }
                  </p>
                  {lastResult.result.confidence && (
                    <div className="mt-2 text-xs text-gray-500">
                      Confiança: {(lastResult.result.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              )}
              
              {lastResult.partialResults && lastResult.partialResults.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Resultados Parciais ({lastResult.partialResults.length}):</h4>
                  <div className="space-y-2">
                    {lastResult.partialResults.map((partial: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                        <Badge variant="outline" className="mb-1">
                          {partial.ksId}
                        </Badge>
                        <p className="text-gray-600 line-clamp-2">
                          {typeof partial.result?.result === 'string' 
                            ? partial.result.result.substring(0, 100) + '...'
                            : 'Resultado estruturado'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-purple-600" />
        <div>
          <h2 className="text-lg font-semibold">Blackboard Architecture System</h2>
          <p className="text-sm text-gray-600">
            Processamento paralelo com Web Workers | 
            {status?.activeKnowledgeSources || 0} Knowledge Sources ativos |
            {status?.totalEntries || 0} entradas no blackboard
          </p>
        </div>
      </div>

      {renderSystemStatus()}

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test">Teste</TabsTrigger>
          <TabsTrigger value="sources">Knowledge Sources</TabsTrigger>
          <TabsTrigger value="entries">Entradas</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test" className="mt-4">
          {renderTestInterface()}
        </TabsContent>
        
        <TabsContent value="sources" className="mt-4">
          {renderKnowledgeSources()}
        </TabsContent>
        
        <TabsContent value="entries" className="mt-4">
          {renderRecentEntries()}
        </TabsContent>
        
        <TabsContent value="monitor" className="mt-4">
          <div className="text-center text-gray-500 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Monitor em tempo real será implementado</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlackboardDashboard;

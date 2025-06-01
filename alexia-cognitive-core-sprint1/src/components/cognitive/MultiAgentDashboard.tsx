
import React, { useState, useEffect } from 'react';
import { useCognitiveOrchestrator } from '@/hooks/useCognitiveOrchestrator';
import { Brain, Zap, BarChart3, Network, Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MultiAgentDashboardProps {
  className?: string;
}

const MultiAgentDashboard: React.FC<MultiAgentDashboardProps> = ({ className }) => {
  const { 
    agents, 
    orchestrateCognitiveProcess,
    processCognitiveCommand,
    processing,
    taskQueue 
  } = useCognitiveOrchestrator();

  const [testInput, setTestInput] = useState('');
  const [orchestrationResult, setOrchestrationResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState<any[]>([]);

  const handleTestOrchestration = async () => {
    if (!testInput.trim()) return;

    setIsRunning(true);
    setOrchestrationResult(null);
    
    try {
      console.log('🎭 Iniciando teste de orquestração multi-agente...');
      
      const result = await orchestrateCognitiveProcess(testInput, {
        mode: 'test',
        includeAll: true
      });
      
      setOrchestrationResult(result);
      
      // Add to execution log
      setExecutionLog(prev => [{
        timestamp: new Date().toISOString(),
        input: testInput,
        result,
        duration: result.processingTime
      }, ...prev.slice(0, 4)]); // Keep last 5 executions
      
    } catch (error) {
      console.error('❌ Erro no teste de orquestração:', error);
      setOrchestrationResult({
        success: false,
        error: error.message,
        processingTime: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuickCommand = async (command: string) => {
    setIsRunning(true);
    try {
      const result = await processCognitiveCommand(command, `Teste do comando ${command}`, {});
      setOrchestrationResult(result);
    } catch (error) {
      console.error(`❌ Erro no comando ${command}:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const renderAgentStatus = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {agents.map((agent) => (
        <Card key={agent.name} className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {agent.description.split(' - ')[0]}
              </CardTitle>
              <Badge variant={agent.available ? "default" : "secondary"}>
                {agent.available ? "Disponível" : "Ocupado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 mb-3">
              {agent.description.split(' - ')[1]}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {agent.specialization.slice(0, 4).map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Cognitivo
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Ativo
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTestInterface = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Entrada de Teste</label>
        <Textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Digite uma consulta complexa para testar o sistema multi-agente..."
          className="min-h-20"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={handleTestOrchestration}
          disabled={isRunning || !testInput.trim()}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Executar Orquestração
            </>
          )}
        </Button>

        <Button 
          variant="outline"
          onClick={() => handleQuickCommand('deep-think')}
          disabled={isRunning}
          size="sm"
        >
          @deep-think
        </Button>

        <Button 
          variant="outline"
          onClick={() => handleQuickCommand('connect')}
          disabled={isRunning}
          size="sm"
        >
          @connect
        </Button>

        <Button 
          variant="outline"
          onClick={() => handleQuickCommand('evolve')}
          disabled={isRunning}
          size="sm"
        >
          @evolve
        </Button>
      </div>

      {orchestrationResult && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Resultado da Orquestração</CardTitle>
              <div className="flex items-center gap-2">
                {orchestrationResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <Badge variant={orchestrationResult.success ? "default" : "destructive"}>
                  {orchestrationResult.success ? "Sucesso" : "Erro"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orchestrationResult.success ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tempo:</span>
                    <span className="ml-2 font-medium">{orchestrationResult.processingTime}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Insights:</span>
                    <span className="ml-2 font-medium">{orchestrationResult.insights.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Conexões:</span>
                    <span className="ml-2 font-medium">{orchestrationResult.connectionsFound}</span>
                  </div>
                </div>

                {orchestrationResult.result && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Resultado:</span>
                    <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded border">
                      {typeof orchestrationResult.result === 'string' 
                        ? orchestrationResult.result 
                        : JSON.stringify(orchestrationResult.result, null, 2)}
                    </p>
                  </div>
                )}

                {orchestrationResult.insights.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Insights:</span>
                    <div className="mt-2 space-y-1">
                      {orchestrationResult.insights.map((insight, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span className="text-gray-600">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-red-600">
                {orchestrationResult.error || 'Erro desconhecido'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderExecutionLog = () => (
    <div className="space-y-3">
      {executionLog.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma execução registrada ainda</p>
        </div>
      ) : (
        executionLog.map((execution, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {new Date(execution.timestamp).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  {execution.result.success ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-red-600" />
                  )}
                  <span className="text-xs text-gray-500">
                    {execution.duration}ms
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2 font-medium">
                {execution.input.substring(0, 100)}...
              </p>
              <div className="text-xs text-gray-600">
                Insights: {execution.result.insights?.length || 0} | 
                Conexões: {execution.result.connectionsFound || 0}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {agents.filter(a => a.available).length}
          </div>
          <div className="text-sm text-gray-600">Agentes Ativos</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {taskQueue.length}
          </div>
          <div className="text-sm text-gray-600">Tarefas na Fila</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {executionLog.filter(e => e.result.success).length}
          </div>
          <div className="text-sm text-gray-600">Execuções Bem-sucedidas</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {executionLog.length > 0 
              ? Math.round(executionLog.reduce((acc, e) => acc + e.duration, 0) / executionLog.length)
              : 0}ms
          </div>
          <div className="text-sm text-gray-600">Tempo Médio</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Network className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold">Multi-Agent Cognitive Dashboard</h2>
            <p className="text-sm text-gray-600">
              Sistema de Orquestração Multi-Agente • 
              {agents.filter(a => a.available).length}/{agents.length} agentes ativos • 
              {processing ? 'Processando...' : 'Pronto'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="test">Teste</TabsTrigger>
            <TabsTrigger value="log">Histórico</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="mt-4">
            {renderAgentStatus()}
          </TabsContent>
          
          <TabsContent value="test" className="mt-4">
            {renderTestInterface()}
          </TabsContent>
          
          <TabsContent value="log" className="mt-4">
            {renderExecutionLog()}
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-4">
            {renderMetrics()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MultiAgentDashboard;

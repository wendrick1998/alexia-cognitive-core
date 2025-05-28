import React, { useState } from 'react';
import { useCognitiveSystem } from '@/hooks/useCognitiveSystem';
import { useCognitiveOrchestrator } from '@/hooks/useCognitiveOrchestrator';
import { Brain, Network, Lightbulb, Zap, Search, Eye, BarChart3, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NeuralVisualization from './NeuralVisualization';

interface CognitiveInterfaceProps {
  className?: string;
}

const CognitiveInterface: React.FC<CognitiveInterfaceProps> = ({ className }) => {
  const { 
    cognitiveState, 
    thoughtModes, 
    switchThoughtMode,
    updateInsightStatus,
    createCognitiveSnapshot,
    neural
  } = useCognitiveSystem();
  
  const { agents, processCognitiveCommand } = useCognitiveOrchestrator();
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const handleThoughtModeChange = (mode: any) => {
    switchThoughtMode(mode);
  };

  const handleInsightAction = (insightId: string, action: 'dismiss' | 'act') => {
    updateInsightStatus(insightId, action === 'dismiss' ? 'dismissed' : 'acted_upon');
  };

  const handleCognitiveCommand = async (command: string, input?: string) => {
    setActiveCommand(command);
    try {
      const result = await processCognitiveCommand(command, input || '', {});
      console.log(`✅ Comando ${command} executado:`, result);
    } catch (error) {
      console.error(`❌ Erro no comando ${command}:`, error);
    } finally {
      setActiveCommand(null);
    }
  };

  const renderThoughtModeSelector = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {thoughtModes.map((mode) => (
        <Button
          key={mode.type}
          variant={cognitiveState.currentMode.type === mode.type ? "default" : "outline"}
          onClick={() => handleThoughtModeChange(mode.type)}
          className="flex flex-col items-center p-4 h-auto space-y-2"
        >
          {mode.type === 'focus' && <Eye className="w-5 h-5" />}
          {mode.type === 'exploration' && <Network className="w-5 h-5" />}
          {mode.type === 'analysis' && <BarChart3 className="w-5 h-5" />}
          {mode.type === 'creative' && <Sparkles className="w-5 h-5" />}
          <span className="text-xs text-center leading-tight">{mode.description.split(' - ')[0]}</span>
        </Button>
      ))}
    </div>
  );

  const renderCognitiveCommands = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <Button
        variant="outline"
        onClick={() => handleCognitiveCommand('deep-think')}
        disabled={activeCommand === 'deep-think'}
        className="flex flex-col items-center p-4 h-auto space-y-2"
      >
        <Brain className="w-5 h-5" />
        <span className="text-xs">@deep-think</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleCognitiveCommand('connect')}
        disabled={activeCommand === 'connect'}
        className="flex flex-col items-center p-4 h-auto space-y-2"
      >
        <Network className="w-5 h-5" />
        <span className="text-xs">@connect</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleCognitiveCommand('evolve')}
        disabled={activeCommand === 'evolve'}
        className="flex flex-col items-center p-4 h-auto space-y-2"
      >
        <Zap className="w-5 h-5" />
        <span className="text-xs">@evolve</span>
      </Button>
      
      <Button
        variant="outline"
        onClick={() => neural.loadActivationPatterns()}
        disabled={neural.isProcessing}
        className="flex flex-col items-center p-4 h-auto space-y-2"
      >
        <Activity className="w-5 h-5" />
        <span className="text-xs">@neural-boost</span>
      </Button>
    </div>
  );

  const renderPendingInsights = () => (
    <div className="space-y-3">
      {cognitiveState.pendingInsights.map((insight) => (
        <Card key={insight.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              <Badge variant={insight.priority_level >= 4 ? "destructive" : insight.priority_level >= 3 ? "default" : "secondary"}>
                Prioridade {insight.priority_level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 mb-3">{insight.content}</p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleInsightAction(insight.id, 'act')}
              >
                Usar
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleInsightAction(insight.id, 'dismiss')}
              >
                Dispensar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {cognitiveState.pendingInsights.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum insight pendente</p>
        </div>
      )}
    </div>
  );

  const renderActiveNodes = () => (
    <div className="space-y-3">
      {cognitiveState.activeNodes.slice(0, 5).map((node) => (
        <Card key={node.id} className="border border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className="text-xs">
                {node.node_type}
              </Badge>
              <span className="text-xs text-gray-500">
                Score: {node.relevance_score.toFixed(2)}
              </span>
            </div>
            {node.title && (
              <h4 className="text-sm font-medium mb-1">{node.title}</h4>
            )}
            <p className="text-xs text-gray-600 line-clamp-2">
              {node.content.substring(0, 150)}...
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{node.access_count} acessos</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => neural.accessNode(node.id, 0.2)}
                className="text-xs h-6 px-2"
              >
                Ativar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {cognitiveState.activeNodes.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum nó cognitivo ativo</p>
        </div>
      )}
    </div>
  );

  const renderAgentStatus = () => (
    <div className="grid grid-cols-1 gap-3">
      {agents.map((agent) => (
        <Card key={agent.name} className="border border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">{agent.description.split(' - ')[0]}</h4>
              <Badge variant={agent.available ? "default" : "secondary"}>
                {agent.available ? "Disponível" : "Ocupado"}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {agent.description.split(' - ')[1]}
            </p>
            <div className="flex flex-wrap gap-1">
              {agent.specialization.slice(0, 3).map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold">Alex iA - Sistema Cognitivo Neural</h2>
            <p className="text-sm text-gray-600">
              Modo: {cognitiveState.currentMode.description} | 
              Carga: {Math.round(cognitiveState.cognitiveLoad * 100)}% | 
              Foco: {Math.round(cognitiveState.focusLevel * 100)}% |
              Ativação Neural: {neural.activationPatterns.length} padrões
            </p>
          </div>
        </div>

        {renderThoughtModeSelector()}
        {renderCognitiveCommands()}

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="nodes">Nós Ativos</TabsTrigger>
            <TabsTrigger value="neural">Neural</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-4">
            {renderPendingInsights()}
          </TabsContent>
          
          <TabsContent value="nodes" className="mt-4">
            {renderActiveNodes()}
          </TabsContent>
          
          <TabsContent value="neural" className="mt-4">
            <NeuralVisualization />
          </TabsContent>
          
          <TabsContent value="agents" className="mt-4">
            {renderAgentStatus()}
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {cognitiveState.activeNodes.length}
                  </div>
                  <div className="text-sm text-gray-600">Nós Ativos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {cognitiveState.recentConnections.length}
                  </div>
                  <div className="text-sm text-gray-600">Conexões</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {neural.activationPatterns.length}
                  </div>
                  <div className="text-sm text-gray-600">Padrões Neurais</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(cognitiveState.focusLevel * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Nível de Foco</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => createCognitiveSnapshot('Snapshot Neural', 'Snapshot com dados neurais')}
            className="w-full"
          >
            📸 Criar Snapshot Cognitivo Neural
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CognitiveInterface;

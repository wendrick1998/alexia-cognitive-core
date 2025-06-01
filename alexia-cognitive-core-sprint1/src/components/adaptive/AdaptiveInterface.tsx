
import React, { useEffect } from 'react';
import { useAdaptiveUI } from '@/hooks/useAdaptiveUI';
import { useProactiveInsights } from '@/hooks/useProactiveInsights';
import { Brain, Lightbulb, Zap, Activity, Settings, Eye, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface AdaptiveInterfaceProps {
  children?: React.ReactNode;
  className?: string;
}

const AdaptiveInterface: React.FC<AdaptiveInterfaceProps> = ({ children, className }) => {
  const {
    currentMode,
    userContext,
    adaptiveElements,
    predictiveActions,
    switchCognitiveMode,
    cognitiveModes,
    getInterfaceConfig,
    getAdaptiveSuggestions,
    shouldShowFeature,
    trackAction,
    cognitiveLoad
  } = useAdaptiveUI();

  const {
    insights,
    deliverInsight,
    markActedUpon,
    dismissInsight,
    updateDeliveryContext,
    insightStats,
    config: insightConfig,
    setConfig: setInsightConfig
  } = useProactiveInsights();

  const interfaceConfig = getInterfaceConfig();
  const suggestions = getAdaptiveSuggestions();

  // Update delivery context based on UI state
  useEffect(() => {
    updateDeliveryContext({
      cognitiveLoad,
      currentTask: userContext.currentTask,
      timeOfDay: userContext.timeOfDay,
      userActivity: 'active' // Would be detected via activity monitoring
    });
  }, [cognitiveLoad, userContext, updateDeliveryContext]);

  const handleModeSwitch = (modeType: 'focus' | 'exploration' | 'analysis' | 'creative') => {
    switchCognitiveMode(modeType);
    trackAction(`switch_mode_${modeType}`, `Mode switch to ${modeType}`);
  };

  const handleInsightAction = (insightId: string, action: string) => {
    markActedUpon(insightId, action);
    trackAction(`insight_action_${action}`, `Acted on insight: ${action}`);
  };

  const renderCognitiveLoadIndicator = () => (
    <div className="flex items-center gap-2 text-xs">
      <Gauge className="w-3 h-3" />
      <span>Carga Cognitiva:</span>
      <Progress value={cognitiveLoad * 100} className="w-16 h-2" />
      <span className={`font-medium ${
        cognitiveLoad > 0.7 ? 'text-red-500' : 
        cognitiveLoad > 0.4 ? 'text-yellow-500' : 'text-green-500'
      }`}>
        {Math.round(cognitiveLoad * 100)}%
      </span>
    </div>
  );

  const renderAdaptiveShortcuts = () => (
    <div className="flex flex-wrap gap-2">
      {interfaceConfig.shortcuts.map((shortcut) => (
        <Button
          key={shortcut.id}
          variant="outline"
          size="sm"
          onClick={() => trackAction(shortcut.id, 'shortcut_used')}
          className="text-xs"
        >
          {shortcut.id.replace('_', ' ')}
          <Badge variant="secondary" className="ml-1 text-xs">
            {shortcut.frequency}
          </Badge>
        </Button>
      ))}
    </div>
  );

  const renderPredictiveActions = () => (
    <div className="space-y-2">
      {predictiveActions.slice(0, 3).map((action, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{action.action}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {Math.round(action.confidence * 100)}%
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => trackAction(action.action, 'predicted_action')}
              className="text-xs"
            >
              {action.shortcut}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProactiveInsights = () => (
    <div className="space-y-3">
      {insights.filter(i => !i.shown).slice(0, 3).map((insight) => (
        <Card key={insight.id} className={`border-l-4 ${
          insight.urgency === 'critical' ? 'border-l-red-500' :
          insight.urgency === 'high' ? 'border-l-orange-500' :
          insight.urgency === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                {insight.title}
              </CardTitle>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {insight.type}
                </Badge>
                <Badge variant={
                  insight.urgency === 'critical' ? 'destructive' :
                  insight.urgency === 'high' ? 'default' : 'secondary'
                } className="text-xs">
                  {insight.urgency}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
            
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="text-center">
                <div className="font-medium">{Math.round(insight.confidence * 100)}%</div>
                <div className="text-gray-500">Confiança</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{Math.round(insight.novelty * 100)}%</div>
                <div className="text-gray-500">Novidade</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{Math.round(insight.actionability * 100)}%</div>
                <div className="text-gray-500">Ação</div>
              </div>
            </div>

            <div className="flex gap-2">
              {insight.suggestedActions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => handleInsightAction(insight.id, action)}
                  className="text-xs flex-1"
                >
                  {action}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissInsight(insight.id)}
                className="text-xs"
              >
                Dispensar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4">
        {/* Header with Cognitive Mode and Load */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-semibold text-sm">Interface Cognitiva Adaptativa</h3>
              <p className="text-xs text-gray-600">
                Modo: {currentMode.description}
              </p>
            </div>
          </div>
          {renderCognitiveLoadIndicator()}
        </div>

        <Tabs defaultValue="modes" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="modes">Modos</TabsTrigger>
            <TabsTrigger value="shortcuts">Atalhos</TabsTrigger>
            <TabsTrigger value="predictions">Predições</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="modes" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.values(cognitiveModes).map((mode) => (
                <Button
                  key={mode.type}
                  variant={currentMode.type === mode.type ? "default" : "outline"}
                  onClick={() => handleModeSwitch(mode.type)}
                  className="text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-sm">{mode.type.charAt(0).toUpperCase() + mode.type.slice(1)}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {mode.description.split(' - ')[1]}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Adaptive Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Sugestões Adaptativas</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm">{suggestion.text}</span>
                      <Button
                        size="sm"
                        onClick={() => trackAction(suggestion.action, 'suggestion_followed')}
                        className="text-xs"
                      >
                        Aplicar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Atalhos Adaptativos</h4>
              {renderAdaptiveShortcuts()}
              
              {adaptiveElements.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Elementos Mais Usados</h5>
                  <div className="space-y-1">
                    {adaptiveElements.slice(0, 5).map((element) => (
                      <div key={element.id} className="flex items-center justify-between text-xs">
                        <span>{element.id.replace('_', ' ')}</span>
                        <Badge variant="outline">{element.frequency}x</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Ações Preditivas</h4>
              {predictiveActions.length > 0 ? renderPredictiveActions() : (
                <p className="text-sm text-gray-500">
                  Colete mais dados de uso para ativar predições
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Insights Proativos</h4>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">{insightStats.total} total</Badge>
                  <Badge variant="outline">{insightStats.actedUpon} ações</Badge>
                </div>
              </div>

              {insights.length > 0 ? renderProactiveInsights() : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum insight disponível</p>
                  <p className="text-xs">Continue usando o sistema para gerar insights</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Sensibilidade de Insights</label>
                <Slider
                  value={[insightConfig.contradictionThreshold]}
                  onValueChange={([value]) => 
                    setInsightConfig(prev => ({ ...prev, contradictionThreshold: value }))
                  }
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Threshold: {insightConfig.contradictionThreshold.toFixed(1)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Interruptibilidade Mínima</label>
                <Slider
                  value={[insightConfig.interruptibilityThreshold]}
                  onValueChange={([value]) => 
                    setInsightConfig(prev => ({ ...prev, interruptibilityThreshold: value }))
                  }
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Threshold: {insightConfig.interruptibilityThreshold.toFixed(1)}
                </div>
              </div>

              <div className="pt-2 border-t">
                <h5 className="text-sm font-medium mb-2">Estatísticas do Sistema</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Complexidade da Interface: {Math.round(currentMode.config.interactionComplexity * 100)}%</div>
                  <div>Densidade de Informação: {Math.round(currentMode.config.informationDensity * 100)}%</div>
                  <div>Nível de Distração: {Math.round(currentMode.config.distractionLevel * 100)}%</div>
                  <div>Complexidade Visual: {Math.round(currentMode.config.visualComplexity * 100)}%</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Main Content Area */}
        {children && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveInterface;

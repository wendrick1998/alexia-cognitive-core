
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Zap, 
  Settings, 
  Database,
  Save,
  AlertTriangle
} from 'lucide-react';

const AIConfiguration = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    llm: {
      primaryModel: 'gpt-4o-mini',
      fallbackModel: 'claude-3-opus',
      temperature: [0.7],
      maxTokens: 2048,
      enableFallback: true,
      cacheResponses: true
    },
    cognitive: {
      memoryConsolidation: true,
      autoInsights: true,
      learningRate: [0.1],
      forgettingFactor: [0.95],
      activationThreshold: [0.3]
    },
    processing: {
      batchSize: 10,
      maxConcurrentRequests: 3,
      timeoutSeconds: 30,
      retryAttempts: 2
    }
  });

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de IA foram atualizadas com sucesso.",
    });
  };

  const resetToDefaults = () => {
    setConfig({
      llm: {
        primaryModel: 'gpt-4o-mini',
        fallbackModel: 'claude-3-opus',
        temperature: [0.7],
        maxTokens: 2048,
        enableFallback: true,
        cacheResponses: true
      },
      cognitive: {
        memoryConsolidation: true,
        autoInsights: true,
        learningRate: [0.1],
        forgettingFactor: [0.95],
        activationThreshold: [0.3]
      },
      processing: {
        batchSize: 10,
        maxConcurrentRequests: 3,
        timeoutSeconds: 30,
        retryAttempts: 2
      }
    });
    
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram restauradas aos valores padrão.",
    });
  };

  return (
    <div className="h-full overflow-y-auto scroll-container premium-scrollbar">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Configurações de IA</h1>
          <p className="text-white/60">Configure os parâmetros do sistema cognitivo</p>
        </div>

        <Tabs defaultValue="llm" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Modelos LLM
            </TabsTrigger>
            <TabsTrigger value="cognitive" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Sistema Cognitivo
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Processamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Configuração dos Modelos LLM</CardTitle>
                <CardDescription>Configure os modelos de linguagem utilizados pelo sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modelo Principal</Label>
                    <Select value={config.llm.primaryModel} onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, llm: { ...prev.llm, primaryModel: value }}))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                        <SelectItem value="groq-mixtral">Groq Mixtral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Modelo de Fallback</Label>
                    <Select value={config.llm.fallbackModel} onValueChange={(value) => 
                      setConfig(prev => ({ ...prev, llm: { ...prev.llm, fallbackModel: value }}))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                        <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                        <SelectItem value="groq-mixtral">Groq Mixtral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Temperatura: {config.llm.temperature[0]}</Label>
                    <Slider
                      value={config.llm.temperature}
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, llm: { ...prev.llm, temperature: value }}))
                      }
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-sm text-white/60">Controla a criatividade das respostas (0 = mais conservador, 2 = mais criativo)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Máximo de Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={config.llm.maxTokens}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, llm: { ...prev.llm, maxTokens: parseInt(e.target.value) }}))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Habilitar Fallback</Label>
                      <p className="text-sm text-white/60">Usar modelo secundário em caso de falha</p>
                    </div>
                    <Switch
                      checked={config.llm.enableFallback}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, llm: { ...prev.llm, enableFallback: checked }}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cache de Respostas</Label>
                      <p className="text-sm text-white/60">Armazenar respostas para consultas similares</p>
                    </div>
                    <Switch
                      checked={config.llm.cacheResponses}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, llm: { ...prev.llm, cacheResponses: checked }}))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cognitive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Sistema Cognitivo</CardTitle>
                <CardDescription>Configure os parâmetros do sistema de memória e aprendizado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Consolidação de Memória</Label>
                      <p className="text-sm text-white/60">Processar e organizar automaticamente as memórias</p>
                    </div>
                    <Switch
                      checked={config.cognitive.memoryConsolidation}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, cognitive: { ...prev.cognitive, memoryConsolidation: checked }}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Insights Automáticos</Label>
                      <p className="text-sm text-white/60">Gerar insights automaticamente a partir dos dados</p>
                    </div>
                    <Switch
                      checked={config.cognitive.autoInsights}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, cognitive: { ...prev.cognitive, autoInsights: checked }}))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Taxa de Aprendizado: {config.cognitive.learningRate[0]}</Label>
                    <Slider
                      value={config.cognitive.learningRate}
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, cognitive: { ...prev.cognitive, learningRate: value }}))
                      }
                      max={1}
                      min={0.01}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fator de Esquecimento: {config.cognitive.forgettingFactor[0]}</Label>
                    <Slider
                      value={config.cognitive.forgettingFactor}
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, cognitive: { ...prev.cognitive, forgettingFactor: value }}))
                      }
                      max={1}
                      min={0.1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Limiar de Ativação: {config.cognitive.activationThreshold[0]}</Label>
                    <Slider
                      value={config.cognitive.activationThreshold}
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, cognitive: { ...prev.cognitive, activationThreshold: value }}))
                      }
                      max={1}
                      min={0.1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Configurações de Processamento</CardTitle>
                <CardDescription>Configure os parâmetros de performance e processamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Tamanho do Lote</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={config.processing.batchSize}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, processing: { ...prev.processing, batchSize: parseInt(e.target.value) }}))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxConcurrent">Máx. Requisições Simultâneas</Label>
                    <Input
                      id="maxConcurrent"
                      type="number"
                      value={config.processing.maxConcurrentRequests}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, processing: { ...prev.processing, maxConcurrentRequests: parseInt(e.target.value) }}))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (segundos)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={config.processing.timeoutSeconds}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, processing: { ...prev.processing, timeoutSeconds: parseInt(e.target.value) }}))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retries">Tentativas de Retry</Label>
                    <Input
                      id="retries"
                      type="number"
                      value={config.processing.retryAttempts}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, processing: { ...prev.processing, retryAttempts: parseInt(e.target.value) }}))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Configurações Avançadas
                </CardTitle>
                <CardDescription>
                  Altere apenas se souber o que está fazendo. Valores incorretos podem afetar a performance.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIConfiguration;

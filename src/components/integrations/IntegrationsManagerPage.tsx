
import { useState } from 'react';
import { useLLMIntegrations } from '@/hooks/useLLMIntegrations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings, Trash2, TestTube, Zap, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IntegrationsManagerPage = () => {
  const { integrations, loading, createIntegration, testIntegration, toggleIntegration, deleteIntegration } = useLLMIntegrations();
  const { toast } = useToast();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    base_url: '',
    api_key: '',
    model: '',
    endpoint_path: '/v1/chat/completions',
    temperature: 0.7,
    max_tokens: 2000,
    fallback_priority: 50,
    active: true,
    custom_headers: '{}'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      base_url: '',
      api_key: '',
      model: '',
      endpoint_path: '/v1/chat/completions',
      temperature: 0.7,
      max_tokens: 2000,
      fallback_priority: 50,
      active: true,
      custom_headers: '{}'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const customHeaders = JSON.parse(formData.custom_headers);
      
      const integrationData = {
        ...formData,
        custom_headers: customHeaders,
        test_status: 'pending' as const,
        avg_response_time: 0
      };

      const result = await createIntegration(integrationData);
      
      if (result) {
        setShowAddDialog(false);
        resetForm();
        
        toast({
          title: "Integração Criada",
          description: "Nova integração adicionada com sucesso. Testando conexão...",
        });
        
        // Testar automaticamente após criação
        setTimeout(() => {
          testIntegration(result.id);
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Erro no JSON",
        description: "Headers customizados devem estar em formato JSON válido",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatLastTested = (timestamp?: string) => {
    if (!timestamp) return 'Nunca';
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const presetConfigurations = [
    {
      name: 'OpenAI GPT-4',
      base_url: 'https://api.openai.com',
      model: 'gpt-4o',
      endpoint_path: '/v1/chat/completions',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Anthropic Claude',
      base_url: 'https://api.anthropic.com',
      model: 'claude-3-sonnet-20240229',
      endpoint_path: '/v1/messages',
      headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }
    },
    {
      name: 'Google Gemini',
      base_url: 'https://generativelanguage.googleapis.com',
      model: 'gemini-pro',
      endpoint_path: '/v1beta/models/gemini-pro:generateContent',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Groq',
      base_url: 'https://api.groq.com/openai',
      model: 'llama3-70b-8192',
      endpoint_path: '/v1/chat/completions',
      headers: { 'Content-Type': 'application/json' }
    }
  ];

  const loadPreset = (preset: any) => {
    setFormData({
      ...formData,
      name: preset.name,
      base_url: preset.base_url,
      model: preset.model,
      endpoint_path: preset.endpoint_path,
      custom_headers: JSON.stringify(preset.headers, null, 2)
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Integrações LLM</h1>
          <p className="text-white/70">Adicione e configure novos provedores de IA sem programação</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Nova Integração LLM</DialogTitle>
              <DialogDescription className="text-gray-300">
                Configure uma nova integração de provedor de IA. Use os presets ou configure manualmente.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="presets" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="presets">Presets Populares</TabsTrigger>
                <TabsTrigger value="manual">Configuração Manual</TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presetConfigurations.map((preset) => (
                    <Card key={preset.name} className="bg-gray-800 border-gray-600 cursor-pointer hover:border-blue-500/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">{preset.name}</h3>
                            <p className="text-gray-400 text-sm">{preset.model}</p>
                            <p className="text-gray-500 text-xs">{preset.base_url}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => loadPreset(preset)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Usar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Nome do Provedor</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Groq Llama 3"
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-white">Modelo Principal</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="Ex: llama3-70b-8192"
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_url" className="text-white">URL Base da API</Label>
                    <Input
                      id="base_url"
                      value={formData.base_url}
                      onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                      placeholder="Ex: https://api.groq.com/openai"
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api_key" className="text-white">API Key</Label>
                      <Input
                        id="api_key"
                        type="password"
                        value={formData.api_key}
                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                        placeholder="Sua API key secreta"
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endpoint_path" className="text-white">Endpoint Path</Label>
                      <Input
                        id="endpoint_path"
                        value={formData.endpoint_path}
                        onChange={(e) => setFormData({ ...formData, endpoint_path: e.target.value })}
                        placeholder="/v1/chat/completions"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Temperatura: {formData.temperature}</Label>
                      <Slider
                        value={[formData.temperature]}
                        onValueChange={(value) => setFormData({ ...formData, temperature: value[0] })}
                        max={2}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_tokens" className="text-white">Max Tokens</Label>
                      <Input
                        id="max_tokens"
                        type="number"
                        value={formData.max_tokens}
                        onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fallback_priority" className="text-white">Prioridade Fallback</Label>
                      <Input
                        id="fallback_priority"
                        type="number"
                        value={formData.fallback_priority}
                        onChange={(e) => setFormData({ ...formData, fallback_priority: parseInt(e.target.value) })}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom_headers" className="text-white">Headers Customizados (JSON)</Label>
                    <Textarea
                      id="custom_headers"
                      value={formData.custom_headers}
                      onChange={(e) => setFormData({ ...formData, custom_headers: e.target.value })}
                      rows={4}
                      placeholder='{"Content-Type": "application/json"}'
                      className="bg-gray-800 border-gray-600 text-white font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                      <Label htmlFor="active" className="text-white">Ativar integração</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Salvar e Testar
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total</p>
                <p className="text-white text-2xl font-bold">{integrations.length}</p>
              </div>
              <Settings className="w-8 h-8 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Ativas</p>
                <p className="text-green-400 text-2xl font-bold">
                  {integrations.filter(i => i.active).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Funcionais</p>
                <p className="text-blue-400 text-2xl font-bold">
                  {integrations.filter(i => i.test_status === 'success').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Tempo Médio</p>
                <p className="text-purple-400 text-2xl font-bold">
                  {integrations.filter(i => i.avg_response_time > 0).length > 0
                    ? `${Math.round(integrations.filter(i => i.avg_response_time > 0).reduce((acc, i) => acc + i.avg_response_time, 0) / integrations.filter(i => i.avg_response_time > 0).length)}ms`
                    : 'N/A'
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Integrações */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Integrações Configuradas</CardTitle>
          <CardDescription className="text-white/60">
            Gerencie suas integrações de provedores de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Nome</TableHead>
                  <TableHead className="text-white/70">Modelo</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Último Teste</TableHead>
                  <TableHead className="text-white/70">Prioridade</TableHead>
                  <TableHead className="text-white/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${integration.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <div>
                          <div className="font-medium text-white">{integration.name}</div>
                          <div className="text-white/60 text-sm">{integration.base_url}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {integration.model}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(integration.test_status)}>
                        {integration.test_status === 'success' && 'Funcionando'}
                        {integration.test_status === 'failed' && 'Falhou'}
                        {integration.test_status === 'pending' && 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/60 text-sm">
                      {formatLastTested(integration.last_tested_at)}
                    </TableCell>
                    <TableCell className="text-white/60">
                      {integration.fallback_priority}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testIntegration(integration.id)}
                          className="h-8"
                        >
                          <TestTube className="w-3 h-3 mr-1" />
                          Testar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleIntegration(integration.id, !integration.active)}
                          className="h-8"
                        >
                          {integration.active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteIntegration(integration.id)}
                          className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsManagerPage;

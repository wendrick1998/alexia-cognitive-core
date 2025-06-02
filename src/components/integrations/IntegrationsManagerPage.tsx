
import { useState } from 'react';
import { useLLMIntegrations } from '@/hooks/useLLMIntegrations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, TestTube, CheckCircle, XCircle, Clock, Settings } from 'lucide-react';

const IntegrationsManagerPage = () => {
  const { integrations, loading, createIntegration, testIntegration, toggleIntegration, deleteIntegration } = useLLMIntegrations();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    base_url: '',
    api_key: '',
    model: '',
    fallback_priority: 50,
    temperature: 0.7,
    max_tokens: 2000,
    endpoint_path: '/v1/chat/completions',
    custom_headers: '{}'
  });

  const handleCreate = async () => {
    try {
      const customHeaders = formData.custom_headers ? JSON.parse(formData.custom_headers) : {};
      
      await createIntegration({
        ...formData,
        custom_headers: customHeaders,
        active: true,
        last_tested_at: undefined,
        test_status: 'pending',
        avg_response_time: 0
      });

      setFormData({
        name: '',
        base_url: '',
        api_key: '',
        model: '',
        fallback_priority: 50,
        temperature: 0.7,
        max_tokens: 2000,
        endpoint_path: '/v1/chat/completions',
        custom_headers: '{}'
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Erro ao criar integração:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciador de Integrações</h1>
          <p className="text-white/70">Adicione e gerencie integrações personalizadas de LLM</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Nova Integração</DialogTitle>
              <DialogDescription className="text-gray-300">
                Configure uma nova integração com provedor de LLM personalizado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome do Provedor</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Groq, Google Gemini"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-white">Modelo Principal</Label>
                  <Input
                    id="model"
                    placeholder="Ex: gpt-4o, claude-3-opus"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_url" className="text-white">URL Base da API</Label>
                <Input
                  id="base_url"
                  placeholder="https://api.openai.com"
                  value={formData.base_url}
                  onChange={(e) => setFormData({...formData, base_url: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key" className="text-white">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="sk-..."
                  value={formData.api_key}
                  onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint_path" className="text-white">Caminho do Endpoint</Label>
                  <Input
                    id="endpoint_path"
                    placeholder="/v1/chat/completions"
                    value={formData.endpoint_path}
                    onChange={(e) => setFormData({...formData, endpoint_path: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fallback_priority" className="text-white">Prioridade de Fallback</Label>
                  <Input
                    id="fallback_priority"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.fallback_priority}
                    onChange={(e) => setFormData({...formData, fallback_priority: parseInt(e.target.value)})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-white">Temperatura Padrão</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_tokens" className="text-white">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    min="1"
                    max="8000"
                    value={formData.max_tokens}
                    onChange={(e) => setFormData({...formData, max_tokens: parseInt(e.target.value)})}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_headers" className="text-white">Headers Customizados (JSON)</Label>
                <Textarea
                  id="custom_headers"
                  placeholder='{"Authorization": "Bearer token", "Custom-Header": "value"}'
                  value={formData.custom_headers}
                  onChange={(e) => setFormData({...formData, custom_headers: e.target.value})}
                  className="bg-white/5 border-white/20 text-white h-20"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!formData.name || !formData.base_url || !formData.api_key || !formData.model}
              >
                <Plus className="w-4 h-4 mr-2" />
                Salvar e Testar
              </Button>
              <Button
                onClick={() => setIsCreating(false)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Integrações */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Integrações Personalizadas</CardTitle>
          <CardDescription className="text-white/60">
            Gerencie suas integrações customizadas de LLM
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-white text-xl mb-2">Nenhuma Integração Personalizada</h3>
              <p className="text-white/60 mb-4">
                Crie sua primeira integração customizada com um provedor de LLM
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Integração
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Nome</TableHead>
                  <TableHead className="text-white/70">URL Base</TableHead>
                  <TableHead className="text-white/70">Modelo</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Ativo</TableHead>
                  <TableHead className="text-white/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{integration.name}</div>
                        <div className="text-white/60 text-sm">
                          Prioridade: {integration.fallback_priority}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/60">
                      {integration.base_url}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {integration.model}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.test_status)}
                        <Badge variant="outline" className={getStatusColor(integration.test_status)}>
                          {integration.test_status === 'success' && 'Funcionando'}
                          {integration.test_status === 'failed' && 'Falhou'}
                          {integration.test_status === 'pending' && 'Não testado'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={integration.active}
                        onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                      />
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
                          variant="ghost"
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

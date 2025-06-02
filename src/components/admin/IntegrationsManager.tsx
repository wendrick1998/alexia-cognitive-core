
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plug, 
  Key, 
  Database, 
  Cloud,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';

const IntegrationsManager = () => {
  const { toast } = useToast();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [integrations, setIntegrations] = useState({
    openai: {
      enabled: true,
      apiKey: 'sk-proj-***************************',
      status: 'connected',
      lastTest: '2024-01-10 14:30'
    },
    anthropic: {
      enabled: true,
      apiKey: 'sk-ant-***************************',
      status: 'connected',
      lastTest: '2024-01-10 14:25'
    },
    supabase: {
      enabled: true,
      url: 'https://your-project.supabase.co',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      status: 'connected',
      lastTest: '2024-01-10 14:20'
    },
    groq: {
      enabled: false,
      apiKey: '',
      status: 'disconnected',
      lastTest: 'Nunca'
    }
  });

  const handleSave = () => {
    toast({
      title: "Integrações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const testConnection = (service: string) => {
    toast({
      title: "Testando conexão...",
      description: `Verificando conectividade com ${service}`,
    });
    
    // Simular teste de conexão
    setTimeout(() => {
      toast({
        title: "Conexão bem-sucedida",
        description: `${service} está funcionando corretamente.`,
      });
    }, 2000);
  };

  const toggleApiKeyVisibility = (service: string) => {
    setShowApiKeys(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const maskApiKey = (key: string, show: boolean) => {
    if (show || !key) return key;
    return key.substring(0, 8) + '*'.repeat(key.length - 8);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <div className="h-full overflow-y-auto scroll-container premium-scrollbar">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Integrações</h1>
          <p className="text-white/60">Configure e gerencie integrações com serviços externos</p>
        </div>

        <Tabs defaultValue="llm" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="llm" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Modelos LLM
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Banco de Dados
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Armazenamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-6">
            {/* OpenAI Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  {getStatusIcon(integrations.openai.status)}
                  OpenAI
                  {getStatusBadge(integrations.openai.status)}
                </CardTitle>
                <CardDescription>Configure a integração com os modelos GPT da OpenAI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar integração OpenAI</Label>
                    <p className="text-sm text-white/60">Usar modelos GPT-4 e GPT-3.5</p>
                  </div>
                  <Switch
                    checked={integrations.openai.enabled}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({ ...prev, openai: { ...prev.openai, enabled: checked }}))
                    }
                  />
                </div>

                {integrations.openai.enabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">Chave da API</Label>
                      <div className="flex gap-2">
                        <Input
                          id="openai-key"
                          type={showApiKeys.openai ? 'text' : 'password'}
                          value={maskApiKey(integrations.openai.apiKey, showApiKeys.openai)}
                          onChange={(e) => 
                            setIntegrations(prev => ({ ...prev, openai: { ...prev.openai, apiKey: e.target.value }}))
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility('openai')}
                        >
                          {showApiKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection('OpenAI')}
                        >
                          Testar
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white/60">
                      Último teste: {integrations.openai.lastTest}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Anthropic Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  {getStatusIcon(integrations.anthropic.status)}
                  Anthropic (Claude)
                  {getStatusBadge(integrations.anthropic.status)}
                </CardTitle>
                <CardDescription>Configure a integração com os modelos Claude da Anthropic</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar integração Anthropic</Label>
                    <p className="text-sm text-white/60">Usar modelos Claude para fallback</p>
                  </div>
                  <Switch
                    checked={integrations.anthropic.enabled}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({ ...prev, anthropic: { ...prev.anthropic, enabled: checked }}))
                    }
                  />
                </div>

                {integrations.anthropic.enabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="anthropic-key">Chave da API</Label>
                      <div className="flex gap-2">
                        <Input
                          id="anthropic-key"
                          type={showApiKeys.anthropic ? 'text' : 'password'}
                          value={maskApiKey(integrations.anthropic.apiKey, showApiKeys.anthropic)}
                          onChange={(e) => 
                            setIntegrations(prev => ({ ...prev, anthropic: { ...prev.anthropic, apiKey: e.target.value }}))
                          }
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility('anthropic')}
                        >
                          {showApiKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection('Anthropic')}
                        >
                          Testar
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-white/60">
                      Último teste: {integrations.anthropic.lastTest}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Groq Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  {getStatusIcon(integrations.groq.status)}
                  Groq
                  {getStatusBadge(integrations.groq.status)}
                </CardTitle>
                <CardDescription>Configure a integração com Groq para inferência rápida</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar integração Groq</Label>
                    <p className="text-sm text-white/60">Usar Groq para inferência de alta velocidade</p>
                  </div>
                  <Switch
                    checked={integrations.groq.enabled}
                    onCheckedChange={(checked) => 
                      setIntegrations(prev => ({ ...prev, groq: { ...prev.groq, enabled: checked }}))
                    }
                  />
                </div>

                {integrations.groq.enabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="groq-key">Chave da API</Label>
                      <div className="flex gap-2">
                        <Input
                          id="groq-key"
                          type={showApiKeys.groq ? 'text' : 'password'}
                          value={integrations.groq.apiKey}
                          onChange={(e) => 
                            setIntegrations(prev => ({ ...prev, groq: { ...prev.groq, apiKey: e.target.value }}))
                          }
                          placeholder="Insira sua chave da API Groq"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility('groq')}
                        >
                          {showApiKeys.groq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection('Groq')}
                        >
                          Testar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  {getStatusIcon(integrations.supabase.status)}
                  Supabase
                  {getStatusBadge(integrations.supabase.status)}
                </CardTitle>
                <CardDescription>Configure a conexão com o banco de dados Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">URL do Projeto</Label>
                  <Input
                    id="supabase-url"
                    value={integrations.supabase.url}
                    onChange={(e) => 
                      setIntegrations(prev => ({ ...prev, supabase: { ...prev.supabase, url: e.target.value }}))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-key">Chave da API</Label>
                  <div className="flex gap-2">
                    <Input
                      id="supabase-key"
                      type={showApiKeys.supabase ? 'text' : 'password'}
                      value={maskApiKey(integrations.supabase.apiKey, showApiKeys.supabase)}
                      onChange={(e) => 
                        setIntegrations(prev => ({ ...prev, supabase: { ...prev.supabase, apiKey: e.target.value }}))
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleApiKeyVisibility('supabase')}
                    >
                      {showApiKeys.supabase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('Supabase')}
                    >
                      Testar
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-white/60">
                  Último teste: {integrations.supabase.lastTest}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Configurações de Armazenamento</CardTitle>
                <CardDescription>Configure onde os arquivos e documentos são armazenados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-white/60">
                  <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configurações de armazenamento em desenvolvimento</p>
                  <p className="text-sm">Atualmente utilizando Supabase Storage</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsManager;

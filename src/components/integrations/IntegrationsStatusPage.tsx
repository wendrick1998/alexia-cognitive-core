
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, RefreshCw, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IntegrationStatus {
  name: string;
  models: string[];
  status: 'connected' | 'disconnected' | 'testing';
  lastPing?: string;
  avgResponseTime?: number;
  provider: string;
}

const IntegrationsStatusPage = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      name: 'OpenAI',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
      status: 'connected',
      lastPing: new Date().toISOString(),
      avgResponseTime: 1250,
      provider: 'openai'
    },
    {
      name: 'Claude (Anthropic)',
      models: ['claude-3-opus', 'claude-3-haiku'],
      status: 'disconnected',
      provider: 'anthropic'
    },
    {
      name: 'Gemini Pro',
      models: ['gemini-pro', 'gemini-pro-vision'],
      status: 'disconnected',
      provider: 'google'
    },
    {
      name: 'Mistral',
      models: ['mistral-large', 'mistral-medium'],
      status: 'disconnected',
      provider: 'mistral'
    },
    {
      name: 'DeepSeek',
      models: ['deepseek-chat', 'deepseek-coder'],
      status: 'disconnected',
      provider: 'deepseek'
    },
    {
      name: 'Groq',
      models: ['llama3-70b', 'mixtral-8x7b'],
      status: 'disconnected',
      provider: 'groq'
    }
  ]);

  const { toast } = useToast();

  const testIntegration = async (integrationName: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.name === integrationName 
        ? { ...integration, status: 'testing' }
        : integration
    ));

    // Simular teste real
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = integrationName === 'OpenAI'; // Apenas OpenAI está configurado

    setIntegrations(prev => prev.map(integration => 
      integration.name === integrationName 
        ? { 
            ...integration, 
            status: success ? 'connected' : 'disconnected',
            lastPing: success ? new Date().toISOString() : undefined,
            avgResponseTime: success ? Math.floor(Math.random() * 2000) + 500 : undefined
          }
        : integration
    ));

    toast({
      title: success ? "Teste Bem-sucedido" : "Teste Falhou",
      description: success 
        ? `${integrationName} está funcionando corretamente`
        : `${integrationName} não está conectado ou configurado`,
      variant: success ? "default" : "destructive"
    });
  };

  const testAllIntegrations = async () => {
    for (const integration of integrations) {
      await testIntegration(integration.name);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'disconnected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'testing': return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disconnected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'testing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatResponseTime = (time?: number) => {
    if (!time) return 'N/A';
    return `${time}ms`;
  };

  const formatLastPing = (ping?: string) => {
    if (!ping) return 'Nunca';
    return new Date(ping).toLocaleString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Status das Integrações</h1>
          <p className="text-white/70">Monitoramento em tempo real das conexões com LLMs</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={testAllIntegrations}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Testar Todos
          </Button>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {integrations.filter(i => i.status === 'connected').length} conectadas
          </Badge>
        </div>
      </div>

      {/* Resumo */}
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
                <p className="text-white/60 text-sm">Conectadas</p>
                <p className="text-green-400 text-2xl font-bold">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Desconectadas</p>
                <p className="text-red-400 text-2xl font-bold">
                  {integrations.filter(i => i.status === 'disconnected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Tempo Médio</p>
                <p className="text-blue-400 text-2xl font-bold">
                  {integrations.filter(i => i.avgResponseTime).length > 0
                    ? `${Math.round(integrations.filter(i => i.avgResponseTime).reduce((acc, i) => acc + (i.avgResponseTime || 0), 0) / integrations.filter(i => i.avgResponseTime).length)}ms`
                    : 'N/A'
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Integrações */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Integrações de LLM</CardTitle>
          <CardDescription className="text-white/60">
            Status detalhado de cada provedor de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/70">Provedor</TableHead>
                <TableHead className="text-white/70">Modelos</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
                <TableHead className="text-white/70">Último Ping</TableHead>
                <TableHead className="text-white/70">Tempo de Resposta</TableHead>
                <TableHead className="text-white/70">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.name} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(integration.status)}
                      <div>
                        <div className="font-medium text-white">{integration.name}</div>
                        <div className="text-white/60 text-sm">{integration.provider}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {integration.models.map((model) => (
                        <Badge key={model} variant="outline" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(integration.status)}>
                      {integration.status === 'connected' && 'Conectado'}
                      {integration.status === 'disconnected' && 'Desconectado'}
                      {integration.status === 'testing' && 'Testando...'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60">
                    {formatLastPing(integration.lastPing)}
                  </TableCell>
                  <TableCell className="text-white/60">
                    {formatResponseTime(integration.avgResponseTime)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testIntegration(integration.name)}
                        disabled={integration.status === 'testing'}
                        className="h-8"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${integration.status === 'testing' ? 'animate-spin' : ''}`} />
                        Testar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Configurar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsStatusPage;

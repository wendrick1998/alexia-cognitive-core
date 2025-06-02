
import { ArrowLeft, Shield, Key, Eye, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useState } from 'react';

const SecurityPage = () => {
  const [settings, setSettings] = useState({
    twoFactor: false,
    dataEncryption: true,
    auditLogging: true,
    sessionTimeout: true,
    apiKeyRotation: false
  });

  const securityMetrics = [
    { label: 'Score de Segurança', value: '85%', status: 'good', icon: Shield },
    { label: 'Chaves Ativas', value: '3', status: 'info', icon: Key },
    { label: 'Últimas Tentativas', value: '0', status: 'good', icon: Eye },
    { label: 'Sessões Ativas', value: '2', status: 'warning', icon: Lock }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'danger': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <Breadcrumbs 
            items={[
              { label: 'Segurança & Privacidade', current: true }
            ]}
          />
        </div>
      </div>
      
      <div className="p-6 space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Segurança & Privacidade
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas configurações de segurança e privacidade
          </p>
        </div>

        {/* Métricas de Segurança */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {securityMetrics.map((metric) => (
            <Card key={metric.label} className="dark:bg-gray-900/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                  </div>
                  <metric.icon className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configurações de Segurança */}
        <Card className="dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Shield className="w-5 h-5" />
              Configurações de Segurança
            </CardTitle>
            <CardDescription>
              Configure as opções de segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-white">Autenticação de Dois Fatores</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch
                checked={settings.twoFactor}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, twoFactor: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-white">Criptografia de Dados</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Criptografar dados sensíveis no armazenamento local
                </p>
              </div>
              <Switch
                checked={settings.dataEncryption}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, dataEncryption: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-white">Log de Auditoria</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Registrar todas as ações importantes do sistema
                </p>
              </div>
              <Switch
                checked={settings.auditLogging}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, auditLogging: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-white">Timeout de Sessão</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Logout automático após inatividade prolongada
                </p>
              </div>
              <Switch
                checked={settings.sessionTimeout}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, sessionTimeout: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-white">Rotação Automática de API Keys</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Renovar chaves de API automaticamente a cada 30 dias
                </p>
              </div>
              <Switch
                checked={settings.apiKeyRotation}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, apiKeyRotation: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Segurança */}
        <Card className="dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Sistema Seguro</p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Nenhum problema de segurança detectado no momento.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityPage;

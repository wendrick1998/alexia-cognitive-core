
import { Shield, Eye, Lock, Database, UserCheck, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const PrivacyPage = () => {
  const [settings, setSettings] = useState({
    dataCollection: true,
    analytics: false,
    personalizedAds: false,
    shareData: false,
    cookiesEssential: true,
    cookiesAnalytics: false,
    cookiesMarketing: false
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Configurações de Privacidade
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Controle como seus dados são coletados e utilizados no Alex IA
          </p>
        </div>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Coleta de Dados
            </CardTitle>
            <CardDescription>
              Configure como o Alex IA coleta e processa seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Permitir coleta de dados de uso</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ajuda a melhorar a experiência e funcionalidades
                </p>
              </div>
              <Switch
                checked={settings.dataCollection}
                onCheckedChange={(value) => updateSetting('dataCollection', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Analytics e métricas</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Coleta dados anônimos sobre uso da plataforma
                </p>
              </div>
              <Switch
                checked={settings.analytics}
                onCheckedChange={(value) => updateSetting('analytics', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Cookies e Rastreamento
            </CardTitle>
            <CardDescription>
              Gerencie os cookies utilizados pela aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Cookies essenciais</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Necessários para funcionamento básico (sempre ativos)
                </p>
              </div>
              <Switch
                checked={settings.cookiesEssential}
                disabled
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Cookies de analytics</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ajudam a entender como você usa a aplicação
                </p>
              </div>
              <Switch
                checked={settings.cookiesAnalytics}
                onCheckedChange={(value) => updateSetting('cookiesAnalytics', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Cookies de marketing</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personalizam anúncios e conteúdo
                </p>
              </div>
              <Switch
                checked={settings.cookiesMarketing}
                onCheckedChange={(value) => updateSetting('cookiesMarketing', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Compartilhamento de Dados
            </CardTitle>
            <CardDescription>
              Controle como seus dados podem ser compartilhados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Compartilhar dados com parceiros</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dados anonimizados para melhorar serviços
                </p>
              </div>
              <Switch
                checked={settings.shareData}
                onCheckedChange={(value) => updateSetting('shareData', value)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Anúncios personalizados</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrar anúncios baseados no seu perfil
                </p>
              </div>
              <Switch
                checked={settings.personalizedAds}
                onCheckedChange={(value) => updateSetting('personalizedAds', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Seus Direitos
            </CardTitle>
            <CardDescription>
              Ações relacionadas aos seus dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Baixar meus dados
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Ver dados coletados
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Corrigir informações
              </Button>
              <Button variant="destructive" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Excluir conta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

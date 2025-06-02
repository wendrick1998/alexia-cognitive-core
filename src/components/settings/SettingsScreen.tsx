
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Palette, 
  Volume2,
  Smartphone,
  Globe,
  Download,
  Zap
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePWA } from '@/hooks/usePWA';

const SettingsScreen = () => {
  const { theme, setTheme } = useTheme();
  const { capabilities, installPWA, requestNotificationPermission } = usePWA();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: theme === 'dark',
    autoSave: true,
    soundEffects: false,
    privacyMode: false
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ 
      ...prev, 
      [key]: !prev[key as keyof typeof prev] 
    }));
    
    if (key === 'darkMode') {
      setTheme(settings.darkMode ? 'light' : 'dark');
    }
  };

  const preferencesSections = [
    {
      title: 'Aparência',
      icon: Palette,
      items: [
        {
          key: 'darkMode',
          label: 'Modo Escuro',
          description: 'Interface com tema escuro',
          value: settings.darkMode
        }
      ]
    },
    {
      title: 'Notificações',
      icon: Bell,
      items: [
        {
          key: 'notifications',
          label: 'Notificações Push',
          description: 'Receber alertas importantes',
          value: settings.notifications
        }
      ]
    },
    {
      title: 'Sistema',
      icon: Settings,
      items: [
        {
          key: 'autoSave',
          label: 'Salvamento Automático',
          description: 'Salvar conversas automaticamente',
          value: settings.autoSave
        },
        {
          key: 'soundEffects',
          label: 'Efeitos Sonoros',
          description: 'Sons de interface',
          value: settings.soundEffects
        }
      ]
    },
    {
      title: 'Privacidade',
      icon: Shield,
      items: [
        {
          key: 'privacyMode',
          label: 'Modo Privado',
          description: 'Não salvar histórico localmente',
          value: settings.privacyMode
        }
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personalize sua experiência com Alex iA
        </p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="pwa">App Nativo</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {preferencesSections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="w-5 h-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-900 dark:text-white">{item.label}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={() => handleToggle(item.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pwa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Instalar como App
              </CardTitle>
              <CardDescription>
                Instale Alex iA na sua tela inicial para uma experiência nativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Pode Instalar:</span>
                  <Badge variant={capabilities.canInstall ? "default" : "secondary"}>
                    {capabilities.canInstall ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Instalado:</span>
                  <Badge variant={capabilities.isInstalled ? "default" : "secondary"}>
                    {capabilities.isInstalled ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Modo Standalone:</span>
                  <Badge variant={capabilities.isStandalone ? "default" : "secondary"}>
                    {capabilities.isStandalone ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Notificações:</span>
                  <Badge variant={capabilities.hasNotificationPermission ? "default" : "secondary"}>
                    {capabilities.hasNotificationPermission ? "Ativas" : "Inativas"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {capabilities.canInstall && !capabilities.isInstalled && (
                  <Button onClick={installPWA} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Instalar Alex iA
                  </Button>
                )}
                
                {!capabilities.hasNotificationPermission && (
                  <Button onClick={requestNotificationPermission} variant="outline" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Ativar Notificações
                  </Button>
                )}

                {capabilities.batteryLevel !== undefined && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Bateria</span>
                      <span className="text-sm">{capabilities.batteryLevel}%</span>
                    </div>
                    {capabilities.isLowBattery && (
                      <Badge variant="destructive" className="text-xs">
                        Modo Economia Ativo
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre Alex iA</CardTitle>
              <CardDescription>
                Seu agente cognitivo pessoal e copiloto full-stack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Versão:</strong> 1.0.0
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Build:</strong> Sprint 1 - UX/UI Optimized
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Última Atualização:</strong> Junho 2025
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Alex iA utiliza tecnologias avançadas de IA para fornecer uma experiência 
                  cognitiva personalizada e inteligente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsScreen;

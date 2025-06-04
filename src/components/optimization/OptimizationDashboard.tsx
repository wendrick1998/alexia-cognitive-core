
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompressionManager from './CompressionManager';
import LazyLoader from './LazyLoader';
import { usePWA } from '@/hooks/usePWA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Smartphone, 
  Wifi, 
  Download,
  Battery,
  Bell,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OptimizationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    capabilities,
    installPWA,
    requestNotificationPermission,
    sendTestNotification,
    enableBatterySaving,
    disableBatterySaving
  } = usePWA();

  const handleNavigateToPWASettings = () => {
    navigate('/settings/pwa');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Otimização Avançada</h1>
        <p className="text-muted-foreground">
          Gerenciamento de performance, PWA e funcionalidades offline
        </p>
      </div>

      <Tabs defaultValue="pwa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="pwa" className="flex items-center gap-2" aria-label="Configurações PWA">
            <Smartphone className="h-4 w-4" />
            PWA
          </TabsTrigger>
          <TabsTrigger value="compression" className="flex items-center gap-2" aria-label="Configurações de compressão">
            <Zap className="h-4 w-4" />
            Compressão
          </TabsTrigger>
          <TabsTrigger value="lazy" className="flex items-center gap-2" aria-label="Configurações de lazy loading">
            <Settings className="h-4 w-4" />
            Lazy Loading
          </TabsTrigger>
        </TabsList>

        {/* PWA Tab */}
        <TabsContent value="pwa" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Smartphone className="w-5 h-5" />
                Progressive Web App (PWA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PWA Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-border">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {capabilities.isStandalone ? '✅' : '❌'}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">App Mode</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-border">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {capabilities.isOnline ? '🌐' : '📱'}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {capabilities.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-border">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {capabilities.hasNotificationPermission ? '🔔' : '🔕'}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Notificações</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-border">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {capabilities.batteryLevel || '--'}%
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Bateria</div>
                </div>
              </div>

              {/* Service Worker Navigation Card */}
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-700 dark:text-blue-300">Service Worker Manager</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Gerencie cache, atualizações e funcionalidades offline
                      </p>
                    </div>
                    <Button 
                      onClick={handleNavigateToPWASettings}
                      variant="outline"
                      className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      Gerenciar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Capabilities */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground">Capacidades PWA</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                    <span className="text-sm text-foreground">Instalação</span>
                    <Badge variant={capabilities.canInstall ? 'default' : 'secondary'}>
                      {capabilities.canInstall ? 'Disponível' : 'Instalado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                    <span className="text-sm text-foreground">Push Notifications</span>
                    <Badge variant={capabilities.supportsPush ? 'default' : 'secondary'}>
                      {capabilities.supportsPush ? 'Suportado' : 'Não Suportado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                    <span className="text-sm text-foreground">Background Sync</span>
                    <Badge variant={capabilities.supportsBackgroundSync ? 'default' : 'secondary'}>
                      {capabilities.supportsBackgroundSync ? 'Suportado' : 'Não Suportado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-muted rounded border border-border">
                    <span className="text-sm text-foreground">Economia Energia</span>
                    <Badge variant={capabilities.isLowBattery ? 'destructive' : 'default'}>
                      {capabilities.isLowBattery ? 'Ativo' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Battery Status */}
              {capabilities.batteryLevel !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Nível da Bateria</span>
                    <span className="text-sm text-foreground">{capabilities.batteryLevel}%</span>
                  </div>
                  <Progress value={capabilities.batteryLevel} className="h-2" />
                  {capabilities.isLowBattery && (
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      ⚠️ Modo economia de energia ativado automaticamente
                    </div>
                  )}
                </div>
              )}

              {/* PWA Actions */}
              <div className="space-y-2">
                {capabilities.canInstall && (
                  <Button 
                    onClick={installPWA} 
                    className="w-full transition-all duration-200 hover:scale-105"
                    aria-label="Instalar aplicativo PWA"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Instalar como App
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {!capabilities.hasNotificationPermission && (
                    <Button 
                      onClick={requestNotificationPermission} 
                      variant="outline"
                      className="transition-all duration-200 hover:bg-muted"
                      aria-label="Solicitar permissão para notificações"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Ativar Notificações
                    </Button>
                  )}
                  
                  {capabilities.hasNotificationPermission && (
                    <Button 
                      onClick={sendTestNotification} 
                      variant="outline"
                      className="transition-all duration-200 hover:bg-muted"
                      aria-label="Enviar notificação de teste"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Testar Notificação
                    </Button>
                  )}
                  
                  <Button 
                    onClick={capabilities.isLowBattery ? disableBatterySaving : enableBatterySaving}
                    variant="outline"
                    className="transition-all duration-200 hover:bg-muted"
                    aria-label={capabilities.isLowBattery ? 'Desativar modo economia de bateria' : 'Ativar modo economia de bateria'}
                  >
                    <Battery className="w-4 h-4 mr-2" />
                    {capabilities.isLowBattery ? 'Desativar Economia' : 'Ativar Economia'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compression Tab */}
        <TabsContent value="compression">
          <CompressionManager />
        </TabsContent>

        {/* Lazy Loading Tab */}
        <TabsContent value="lazy" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="w-5 h-5" />
                Lazy Loading Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Demonstração do carregamento lazy de componentes para otimizar performance.
                </p>
                
                <LazyLoader
                  component={() => import('@/components/performance/PerformanceDashboard')}
                  fallback={
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Carregando Performance Dashboard...</p>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptimizationDashboard;

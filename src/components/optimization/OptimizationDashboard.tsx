
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceWorkerManager from './ServiceWorkerManager';
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
  Settings
} from 'lucide-react';

const OptimizationDashboard: React.FC = () => {
  const {
    capabilities,
    installPWA,
    requestNotificationPermission,
    sendTestNotification,
    enableBatterySaving,
    disableBatterySaving
  } = usePWA();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Otimização Avançada</h1>
        <p className="text-gray-600">
          Gerenciamento de performance, PWA e funcionalidades offline
        </p>
      </div>

      <Tabs defaultValue="pwa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pwa" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            PWA
          </TabsTrigger>
          <TabsTrigger value="serviceworker" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Service Worker
          </TabsTrigger>
          <TabsTrigger value="compression" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Compressão
          </TabsTrigger>
          <TabsTrigger value="lazy" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Lazy Loading
          </TabsTrigger>
        </TabsList>

        {/* PWA Tab */}
        <TabsContent value="pwa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Progressive Web App (PWA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PWA Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {capabilities.isStandalone ? '✅' : '❌'}
                  </div>
                  <div className="text-xs text-blue-600">App Mode</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {capabilities.isOnline ? '🌐' : '📱'}
                  </div>
                  <div className="text-xs text-green-600">
                    {capabilities.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {capabilities.hasNotificationPermission ? '🔔' : '🔕'}
                  </div>
                  <div className="text-xs text-purple-600">Notificações</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {capabilities.batteryLevel || '--'}%
                  </div>
                  <div className="text-xs text-orange-600">Bateria</div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Capacidades PWA</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Instalação</span>
                    <Badge variant={capabilities.canInstall ? 'default' : 'secondary'}>
                      {capabilities.canInstall ? 'Disponível' : 'Instalado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Push Notifications</span>
                    <Badge variant={capabilities.supportsPush ? 'default' : 'secondary'}>
                      {capabilities.supportsPush ? 'Suportado' : 'Não Suportado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Background Sync</span>
                    <Badge variant={capabilities.supportsBackgroundSync ? 'default' : 'secondary'}>
                      {capabilities.supportsBackgroundSync ? 'Suportado' : 'Não Suportado'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Economia Energia</span>
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
                    <span className="text-sm font-medium">Nível da Bateria</span>
                    <span className="text-sm">{capabilities.batteryLevel}%</span>
                  </div>
                  <Progress value={capabilities.batteryLevel} className="h-2" />
                  {capabilities.isLowBattery && (
                    <div className="text-xs text-orange-600">
                      ⚠️ Modo economia de energia ativado automaticamente
                    </div>
                  )}
                </div>
              )}

              {/* PWA Actions */}
              <div className="space-y-2">
                {capabilities.canInstall && (
                  <Button onClick={installPWA} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Instalar como App
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {!capabilities.hasNotificationPermission && (
                    <Button onClick={requestNotificationPermission} variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Ativar Notificações
                    </Button>
                  )}
                  
                  {capabilities.hasNotificationPermission && (
                    <Button onClick={sendTestNotification} variant="outline">
                      <Bell className="w-4 h-4 mr-2" />
                      Testar Notificação
                    </Button>
                  )}
                  
                  <Button 
                    onClick={capabilities.isLowBattery ? disableBatterySaving : enableBatterySaving}
                    variant="outline"
                  >
                    <Battery className="w-4 h-4 mr-2" />
                    {capabilities.isLowBattery ? 'Desativar Economia' : 'Ativar Economia'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Worker Tab */}
        <TabsContent value="serviceworker">
          <ServiceWorkerManager />
        </TabsContent>

        {/* Compression Tab */}
        <TabsContent value="compression">
          <CompressionManager />
        </TabsContent>

        {/* Lazy Loading Tab */}
        <TabsContent value="lazy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Lazy Loading Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Demonstração do carregamento lazy de componentes para otimizar performance.
                </p>
                
                <LazyLoader
                  component={() => import('@/components/performance/PerformanceDashboard')}
                  fallback={
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-500">Carregando Performance Dashboard...</p>
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

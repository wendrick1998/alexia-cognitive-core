
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Zap, Wifi, Brain, Bell } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { 
    capabilities, 
    installPWA, 
    requestNotificationPermission,
    sendTestNotification 
  } = usePWA();

  if (!capabilities.canInstall || capabilities.isInstalled) return null;

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Performance Nativa",
      description: "Velocidade e responsividade de app nativo"
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: "Funciona Offline",
      description: "IA básica disponível mesmo sem internet"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Memória Persistente",
      description: "Suas conversas sincronizam automaticamente"
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Notificações Inteligentes",
      description: "Insights proativos e lembretes personalizados"
    }
  ];

  return (
    <Card className="mx-4 my-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Instalar Alex iA
        </CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            PWA Avançado
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
            IA Offline
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg border border-blue-100">
              <div className="text-blue-600 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 text-sm">{feature.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2 bg-white/60 rounded border border-blue-100">
            <span className="text-slate-600">Online/Offline</span>
            <Badge variant={capabilities.isOnline ? "default" : "destructive"} className="text-xs py-0 px-2">
              {capabilities.isOnline ? "✓ Online" : "⚡ Offline"}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/60 rounded border border-blue-100">
            <span className="text-slate-600">Notificações</span>
            <Badge variant={capabilities.hasNotificationPermission ? "default" : "outline"} className="text-xs py-0 px-2">
              {capabilities.hasNotificationPermission ? "✓ Ativo" : "⚠ Pendente"}
            </Badge>
          </div>
        </div>

        {/* Battery status */}
        {capabilities.batteryLevel !== undefined && (
          <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700">Bateria</span>
              {capabilities.isLowBattery && (
                <Badge variant="destructive" className="text-xs">
                  Modo Economia
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    capabilities.isLowBattery ? 'bg-red-500' : 
                    capabilities.batteryLevel > 50 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${capabilities.batteryLevel}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600">
                {capabilities.batteryLevel}%
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={installPWA}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Download className="w-5 h-5 mr-2" />
            Instalar Alex iA
          </Button>
          
          {!capabilities.hasNotificationPermission && (
            <Button 
              onClick={requestNotificationPermission}
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
            >
              <Bell className="w-4 h-4 mr-2" />
              Ativar Notificações
            </Button>
          )}
          
          {capabilities.hasNotificationPermission && (
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              size="sm"
              className="w-full border-green-200 text-green-700 hover:bg-green-50 rounded-xl"
            >
              Testar Notificação
            </Button>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl text-center">
          <p className="text-sm font-medium">
            🚀 Experiência 300% mais rápida
          </p>
          <p className="text-xs opacity-90 mt-1">
            Acesso instantâneo + IA sempre disponível
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;

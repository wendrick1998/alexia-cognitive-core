
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  isUpdating: boolean;
  cacheSize: number;
  lastUpdate: Date | null;
}

const ServiceWorkerManager: React.FC = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isActive: false,
    isUpdating: false,
    cacheSize: 0,
    lastUpdate: null
  });

  useEffect(() => {
    if (!status.isSupported) return;

    const checkServiceWorkerStatus = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          setStatus(prev => ({
            ...prev,
            isRegistered: true,
            isActive: !!registration.active,
            lastUpdate: new Date()
          }));

          // Check for updates
          registration.addEventListener('updatefound', () => {
            setStatus(prev => ({ ...prev, isUpdating: true }));
            
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  setStatus(prev => ({ ...prev, isUpdating: false }));
                  toast({
                    title: "🔄 Atualização Disponível",
                    description: "Nova versão do Alex iA está pronta!",
                    duration: 5000,
                  });
                }
              });
            }
          });
        }

        // Estimate cache size
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          setStatus(prev => ({
            ...prev,
            cacheSize: Math.round((estimate.usage || 0) / 1024 / 1024)
          }));
        }
      } catch (error) {
        console.error('Service Worker status check failed:', error);
      }
    };

    checkServiceWorkerStatus();
    const interval = setInterval(checkServiceWorkerStatus, 30000);

    return () => clearInterval(interval);
  }, [status.isSupported, toast]);

  const registerServiceWorker = async () => {
    if (!status.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      setStatus(prev => ({
        ...prev,
        isRegistered: true,
        isActive: !!registration.active,
        lastUpdate: new Date()
      }));

      toast({
        title: "✅ Service Worker Ativo",
        description: "Cache offline ativado com sucesso!",
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      toast({
        title: "❌ Erro no Service Worker",
        description: "Não foi possível ativar o cache offline",
        variant: "destructive",
      });
    }
  };

  const updateServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        toast({
          title: "🔄 Verificando Atualizações",
          description: "Buscando nova versão...",
        });
      }
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      setStatus(prev => ({ ...prev, cacheSize: 0 }));
      
      toast({
        title: "🗑️ Cache Limpo",
        description: "Todos os dados em cache foram removidos",
      });
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  };

  if (!status.isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Service Worker Não Suportado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Seu navegador não suporta Service Workers. 
            Algumas funcionalidades offline podem não estar disponíveis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.isActive ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          )}
          Service Worker Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant={status.isActive ? 'default' : 'secondary'}>
                {status.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache</span>
              <span className="text-sm font-medium">{status.cacheSize} MB</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Offline</span>
              {navigator.onLine ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última Atualização</span>
              <span className="text-xs text-gray-500">
                {status.lastUpdate ? status.lastUpdate.toLocaleTimeString() : 'Nunca'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {!status.isRegistered ? (
            <Button onClick={registerServiceWorker} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Ativar Cache Offline
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={updateServiceWorker} 
                variant="outline"
                disabled={status.isUpdating}
              >
                {status.isUpdating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Atualizar
              </Button>
              
              <Button onClick={clearCache} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Limpar Cache
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Service Worker permite funcionamento offline e cache inteligente
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceWorkerManager;

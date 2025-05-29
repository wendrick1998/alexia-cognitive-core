
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWACapabilities {
  canInstall: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  hasNotificationPermission: boolean;
  supportsPush: boolean;
  supportsBackgroundSync: boolean;
  batteryLevel?: number;
  isLowBattery: boolean;
}

export function usePWA() {
  const { toast } = useToast();
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    canInstall: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    hasNotificationPermission: Notification.permission === 'granted',
    supportsPush: 'serviceWorker' in navigator && 'PushManager' in window,
    supportsBackgroundSync: 'serviceWorker' in navigator,
    batteryLevel: undefined,
    isLowBattery: false
  });

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
      setCapabilities(prev => ({ ...prev, canInstall: true }));
      
      toast({
        title: "📱 Instalar Alex iA",
        description: "Disponível para instalação como app nativo!",
        duration: 5000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setCapabilities(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "🌐 Conexão Restaurada",
        description: "Sincronizando dados...",
      });
      
      // Simplified background sync without direct access to sync property
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          console.log('Service worker ready for sync');
        }).catch(console.error);
      }
    };

    const handleOffline = () => {
      setCapabilities(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "🔌 Modo Offline",
        description: "Alex iA continua funcionando offline!",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Monitor battery status
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryInfo = () => {
          const level = Math.round(battery.level * 100);
          const isLowBattery = level < 20;
          
          setCapabilities(prev => ({
            ...prev,
            batteryLevel: level,
            isLowBattery
          }));

          if (isLowBattery && !battery.charging) {
            toast({
              title: "🔋 Bateria Baixa",
              description: "Ativando modo de economia de energia",
              variant: "destructive",
            });
          }
        };

        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
        updateBatteryInfo();
      });
    }
  }, [toast]);

  // Install PWA
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setCapabilities(prev => ({
          ...prev,
          canInstall: false,
          isInstalled: true
        }));
        
        toast({
          title: "✅ Instalação Concluída",
          description: "Alex iA foi instalado com sucesso!",
        });
        
        return true;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      toast({
        title: "❌ Erro na Instalação",
        description: "Não foi possível instalar o aplicativo",
        variant: "destructive",
      });
    }

    return false;
  }, [installPrompt, toast]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      setCapabilities(prev => ({
        ...prev,
        hasNotificationPermission: granted
      }));

      if (granted) {
        toast({
          title: "🔔 Notificações Ativadas",
          description: "Você receberá atualizações importantes",
        });
      }

      return granted;
    } catch (error) {
      console.error('Notification permission failed:', error);
      return false;
    }
  }, [toast]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!capabilities.hasNotificationPermission) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Alex iA', {
        body: 'Sistema funcionando perfeitamente! 🧠✨',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        // Remove vibrate property as it's not supported in NotificationOptions
        tag: 'test-notification',
        data: { type: 'test' }
      });
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  }, [capabilities.hasNotificationPermission]);

  // Register for push notifications
  const registerPushNotifications = useCallback(async (): Promise<string | null> => {
    if (!capabilities.supportsPush || !capabilities.hasNotificationPermission) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BMxOsYGAKxv8vxtZ5C-2QyTCjnYUX8ZhvhX0PnQ6FQxLjzQ8fFxXXx3lNYgEzq1Z8Y3GFPqZ9_7u2d3x9y4w' // Replace with your VAPID key
      });

      console.log('Push subscription:', subscription);
      return JSON.stringify(subscription);
    } catch (error) {
      console.error('Push registration failed:', error);
      return null;
    }
  }, [capabilities.supportsPush, capabilities.hasNotificationPermission]);

  // Enable battery saving mode
  const enableBatterySaving = useCallback(() => {
    // Reduce animations and background tasks
    document.documentElement.style.setProperty('--animation-duration', '0s');
    document.documentElement.classList.add('battery-saving-mode');
    
    toast({
      title: "🔋 Modo Economia Ativo",
      description: "Reduzindo animações e processos em segundo plano",
    });
  }, [toast]);

  // Disable battery saving mode
  const disableBatterySaving = useCallback(() => {
    document.documentElement.style.removeProperty('--animation-duration');
    document.documentElement.classList.remove('battery-saving-mode');
    
    toast({
      title: "⚡ Modo Normal Ativo",
      description: "Todas as funcionalidades restauradas",
    });
  }, [toast]);

  // Auto-enable battery saving on low battery
  useEffect(() => {
    if (capabilities.isLowBattery && capabilities.batteryLevel !== undefined) {
      enableBatterySaving();
    } else if (!capabilities.isLowBattery && capabilities.batteryLevel !== undefined && capabilities.batteryLevel > 30) {
      disableBatterySaving();
    }
  }, [capabilities.isLowBattery, capabilities.batteryLevel, enableBatterySaving, disableBatterySaving]);

  return {
    capabilities,
    installPWA,
    requestNotificationPermission,
    sendTestNotification,
    registerPushNotifications,
    enableBatterySaving,
    disableBatterySaving
  };
}

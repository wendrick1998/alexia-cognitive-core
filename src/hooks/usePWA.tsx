
import { useState, useEffect, useCallback } from 'react';

interface PWACapabilities {
  canInstall: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  batteryLevel?: number;
  isLowBattery?: boolean;
}

export function usePWA() {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    canInstall: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    hasNotificationPermission: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Check if PWA is installed
  const checkInstallation = useCallback(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');
    
    setCapabilities(prev => ({ ...prev, isInstalled }));
  }, []);

  // Check notification permission
  const checkNotificationPermission = useCallback(() => {
    if ('Notification' in window) {
      const hasPermission = Notification.permission === 'granted';
      setCapabilities(prev => ({ ...prev, hasNotificationPermission: hasPermission }));
    }
  }, []);

  // Check battery status
  const checkBatteryStatus = useCallback(async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        const batteryLevel = Math.round(battery.level * 100);
        const isLowBattery = batteryLevel < 20;
        
        setCapabilities(prev => ({ 
          ...prev, 
          batteryLevel, 
          isLowBattery 
        }));
      } catch (error) {
        // Battery API not supported or failed
      }
    }
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setCapabilities(prev => ({ ...prev, canInstall: false, isInstalled: true }));
      }
    }
  }, [deferredPrompt]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const hasPermission = permission === 'granted';
      setCapabilities(prev => ({ ...prev, hasNotificationPermission: hasPermission }));
      return hasPermission;
    }
    return false;
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(() => {
    if (capabilities.hasNotificationPermission) {
      new Notification('Alex IA', {
        body: 'Notificações estão funcionando!',
        icon: '/icon-192x192.png'
      });
    }
  }, [capabilities.hasNotificationPermission]);

  useEffect(() => {
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCapabilities(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setCapabilities(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      setDeferredPrompt(null);
    };

    // Listen for online/offline
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial checks
    checkInstallation();
    checkNotificationPermission();
    checkBatteryStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkInstallation, checkNotificationPermission, checkBatteryStatus]);

  return {
    capabilities,
    installPWA,
    requestNotificationPermission,
    sendTestNotification
  };
}

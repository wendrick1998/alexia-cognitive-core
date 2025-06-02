
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Download, Smartphone, Zap } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { capabilities, installPWA } = usePWA();

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Show banner if can install and not already installed
    if (capabilities.canInstall && !capabilities.isInstalled) {
      // Delay showing banner to not interrupt initial experience
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [capabilities.canInstall, capabilities.isInstalled]);

  // Don't show if already installed or can't install
  if (!isVisible || capabilities.isInstalled || !capabilities.canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Check if user already dismissed this session
  if (sessionStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Instalar Alex iA
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {isIOS 
                  ? 'Toque em "Compartilhar" e depois "Adicionar à Tela de Início"'
                  : 'Tenha acesso rápido e experiência nativa'
                }
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  <Zap className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                  Nativo
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {!isIOS && (
          <Button
            onClick={handleInstall}
            size="sm"
            className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Instalar Agora
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PWAInstallBanner;

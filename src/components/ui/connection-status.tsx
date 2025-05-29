
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { error, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className={cn(
        "fixed z-30 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2",
        isMobile 
          ? "bottom-24 right-4 left-4" // Acima da bottom navigation
          : "bottom-4 right-4"
      )}>
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">Sem conexão</span>
      </div>
    );
  }

  if (error && isAuthenticated) {
    return (
      <div className={cn(
        "fixed z-30 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2",
        isMobile 
          ? "bottom-24 right-4 left-4" // Acima da bottom navigation
          : "bottom-4 right-4"
      )}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Problema de autenticação</span>
      </div>
    );
  }

  return null;
};

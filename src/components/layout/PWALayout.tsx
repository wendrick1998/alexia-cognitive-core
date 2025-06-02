
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PWALayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PWALayout = ({ children, className }: PWALayoutProps) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode (PWA)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Add CSS classes to body based on environment
    if (isStandaloneMode) {
      document.body.classList.add('standalone-mode');
    }
    
    if (isIOSDevice) {
      document.body.classList.add('ios-pwa');
    }

    // 🚫 ELIMINAR BOUNCE SCROLL - Prevent zoom on iOS
    if (isIOSDevice) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
      
      // Remove existing viewport meta if present
      const existingMeta = document.querySelector('meta[name="viewport"]');
      if (existingMeta) {
        document.head.removeChild(existingMeta);
      }
      
      document.head.appendChild(meta);

      return () => {
        if (document.head.contains(meta)) {
          document.head.removeChild(meta);
        }
      };
    }
  }, []);

  return (
    <div 
      className={cn(
        'min-h-screen w-full main-container',
        'overscroll-contain touch-manipulation',
        {
          'standalone-mode': isStandalone,
          'ios-pwa': isIOS,
        },
        className
      )}
      style={{
        height: '100dvh',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
};

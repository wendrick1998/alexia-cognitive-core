
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PWALayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PWALayout = ({ children, className }: PWALayoutProps) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    // Detect PWA standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    // Handle viewport height for mobile browsers
    const updateViewportHeight = () => {
      // Use the actual viewport height, accounting for mobile browser UI
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(`${window.innerHeight}px`);
    };

    checkStandalone();
    updateViewportHeight();

    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  return (
    <div 
      className={cn(
        "relative w-full bg-background text-foreground",
        isStandalone ? "min-h-screen" : "min-h-screen",
        className
      )}
      style={{
        height: viewportHeight,
        minHeight: viewportHeight,
      }}
    >
      {/* Safe area handling */}
      <style jsx>{`
        .safe-area-padding-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .safe-area-padding-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
      
      {children}
    </div>
  );
};

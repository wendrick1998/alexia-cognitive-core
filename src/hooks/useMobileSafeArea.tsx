
import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface MobileLayoutConfig {
  safeAreaInsets: SafeAreaInsets;
  isStandalone: boolean;
  hasBottomBar: boolean;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
}

export function useMobileSafeArea() {
  const [config, setConfig] = useState<MobileLayoutConfig>({
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    hasBottomBar: true,
    keyboardHeight: 0,
    isKeyboardOpen: false
  });

  // Get CSS environment variables for safe area
  const getSafeAreaInsets = (): SafeAreaInsets => {
    const getEnvValue = (property: string): number => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--safe-area-inset-${property}`)
        .replace('px', '');
      return parseInt(value) || 0;
    };

    return {
      top: getEnvValue('top'),
      right: getEnvValue('right'),
      bottom: getEnvValue('bottom'),
      left: getEnvValue('left')
    };
  };

  // Monitor keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height;
        const isKeyboardOpen = keyboardHeight > 150; // Threshold for keyboard detection
        
        setConfig(prev => ({
          ...prev,
          keyboardHeight,
          isKeyboardOpen,
          safeAreaInsets: getSafeAreaInsets()
        }));
      }
    };

    // Listen for viewport changes (keyboard show/hide)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }

    // Fallback for older browsers
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor standalone mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, isStandalone: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate safe styles for different elements
  const getChatAreaStyles = () => ({
    paddingTop: `${config.safeAreaInsets.top}px`,
    paddingBottom: config.isKeyboardOpen 
      ? `${config.keyboardHeight + 80}px` // Extra space for input
      : `${config.safeAreaInsets.bottom + (config.hasBottomBar ? 80 : 20)}px`,
    paddingLeft: `${config.safeAreaInsets.left}px`,
    paddingRight: `${config.safeAreaInsets.right}px`,
    height: config.isKeyboardOpen 
      ? `${window.visualViewport?.height || window.innerHeight}px`
      : '100vh'
  });

  const getInputAreaStyles = () => ({
    paddingBottom: config.isKeyboardOpen 
      ? `${config.safeAreaInsets.bottom}px`
      : `${config.safeAreaInsets.bottom + (config.hasBottomBar ? 70 : 10)}px`,
    paddingLeft: `${config.safeAreaInsets.left}px`,
    paddingRight: `${config.safeAreaInsets.right}px`,
    position: 'fixed' as const,
    bottom: config.isKeyboardOpen ? '0px' : 'auto',
    left: '0',
    right: '0',
    zIndex: 50
  });

  const getBottomNavStyles = () => ({
    paddingBottom: `${config.safeAreaInsets.bottom}px`,
    paddingLeft: `${config.safeAreaInsets.left}px`,
    paddingRight: `${config.safeAreaInsets.right}px`,
    display: config.isKeyboardOpen ? 'none' : 'flex'
  });

  return {
    config,
    getChatAreaStyles,
    getInputAreaStyles,
    getBottomNavStyles,
    isIOSPWA: config.isStandalone && /iPad|iPhone|iPod/.test(navigator.userAgent)
  };
}

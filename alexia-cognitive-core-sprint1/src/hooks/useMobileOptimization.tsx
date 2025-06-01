
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MobileCapabilities {
  touchSupport: boolean;
  orientationSupport: boolean;
  vibrationSupport: boolean;
  accelerometerSupport: boolean;
  gyroscopeSupport: boolean;
  ambientLightSupport: boolean;
  proximitySupport: boolean;
  batterySupport: boolean;
  networkSupport: boolean;
}

interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: string;
  browser: string;
}

interface GestureConfig {
  swipeThreshold: number;
  tapThreshold: number;
  longPressThreshold: number;
  pinchThreshold: number;
}

export function useMobileOptimization() {
  const { toast } = useToast();
  
  const [capabilities, setCapabilities] = useState<MobileCapabilities>({
    touchSupport: 'ontouchstart' in window,
    orientationSupport: 'orientation' in window,
    vibrationSupport: 'vibrate' in navigator,
    accelerometerSupport: 'DeviceMotionEvent' in window,
    gyroscopeSupport: 'DeviceOrientationEvent' in window,
    ambientLightSupport: 'ondevicelight' in window,
    proximitySupport: 'ondeviceproximity' in window,
    batterySupport: 'getBattery' in navigator,
    networkSupport: 'connection' in navigator
  });

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    platform: navigator.platform,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTablet: /iPad|Android.*Tablet|Windows.*Touch/i.test(navigator.userAgent),
    isDesktop: !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    os: getOS(),
    browser: getBrowser()
  });

  const [gestureConfig] = useState<GestureConfig>({
    swipeThreshold: 50,
    tapThreshold: 10,
    longPressThreshold: 500,
    pinchThreshold: 10
  });

  // Detect OS
  function getOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
  }

  // Detect Browser
  function getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Vibration patterns
  const vibrationPatterns = {
    tap: [50],
    success: [100, 50, 100],
    error: [200, 100, 200, 100, 200],
    notification: [150, 100, 150],
    longPress: [75]
  };

  // Vibrate with pattern
  const vibrate = useCallback((pattern: keyof typeof vibrationPatterns) => {
    if (!capabilities.vibrationSupport) return;
    
    try {
      navigator.vibrate(vibrationPatterns[pattern]);
    } catch (error) {
      console.warn('Vibration failed:', error);
    }
  }, [capabilities.vibrationSupport]);

  // Gesture detection
  const createGestureDetector = useCallback((element: HTMLElement) => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isLongPress = false;
    let longPressTimer: NodeJS.Timeout;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isLongPress = false;

      // Long press detection
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        vibrate('longPress');
        element.dispatchEvent(new CustomEvent('longpress', {
          detail: { x: startX, y: startY }
        }));
      }, gestureConfig.longPressThreshold);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if moved too much
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > gestureConfig.tapThreshold) {
        clearTimeout(longPressTimer);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      clearTimeout(longPressTimer);

      if (isLongPress) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Tap detection
      if (distance < gestureConfig.tapThreshold && deltaTime < 300) {
        vibrate('tap');
        element.dispatchEvent(new CustomEvent('tap', {
          detail: { x: endX, y: endY }
        }));
        return;
      }

      // Swipe detection
      if (distance > gestureConfig.swipeThreshold) {
        let direction = '';
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        element.dispatchEvent(new CustomEvent('swipe', {
          detail: { 
            direction, 
            deltaX, 
            deltaY, 
            distance,
            velocity: distance / deltaTime
          }
        }));
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(longPressTimer);
    };
  }, [gestureConfig, vibrate]);

  // Orientation change handler
  useEffect(() => {
    const handleOrientationChange = () => {
      setTimeout(() => {
        setDeviceInfo(prev => ({
          ...prev,
          orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        }));
      }, 100); // Small delay to ensure screen dimensions are updated
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Device motion and orientation
  const enableMotionSensors = useCallback(() => {
    if (!capabilities.accelerometerSupport && !capabilities.gyroscopeSupport) {
      return false;
    }

    try {
      // Request permission for iOS
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              setupMotionListeners();
            }
          })
          .catch(console.error);
      } else {
        setupMotionListeners();
      }
      
      return true;
    } catch (error) {
      console.error('Motion sensors setup failed:', error);
      return false;
    }
  }, [capabilities.accelerometerSupport, capabilities.gyroscopeSupport]);

  const setupMotionListeners = useCallback(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.acceleration;
      if (acceleration) {
        // Detect shake gesture
        const totalAcceleration = Math.abs(acceleration.x || 0) + 
                                 Math.abs(acceleration.y || 0) + 
                                 Math.abs(acceleration.z || 0);
        
        if (totalAcceleration > 15) {
          vibrate('notification');
          window.dispatchEvent(new CustomEvent('deviceshake'));
        }
      }
    };

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      window.dispatchEvent(new CustomEvent('deviceorientation', {
        detail: {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        }
      }));
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [vibrate]);

  // Adaptive UI based on device
  const getAdaptiveStyles = useCallback(() => {
    const styles: React.CSSProperties = {};

    if (deviceInfo.isMobile) {
      styles.fontSize = '16px'; // Prevent zoom on iOS
      styles.touchAction = 'manipulation'; // Disable double-tap zoom
    }

    if (deviceInfo.orientation === 'landscape' && deviceInfo.isMobile) {
      styles.height = '100vh';
      styles.maxHeight = '100vh';
    }

    return styles;
  }, [deviceInfo]);

  // Network-aware optimizations
  const getNetworkOptimizations = useCallback(() => {
    if (!capabilities.networkSupport) return {};

    const connection = (navigator as any).connection;
    if (!connection) return {};

    const optimizations = {
      enableLazyLoading: true,
      imageQuality: 'high',
      animationDuration: 'normal',
      preloadContent: true
    };

    // Adjust based on connection
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      optimizations.imageQuality = 'low';
      optimizations.animationDuration = 'fast';
      optimizations.preloadContent = false;
    } else if (connection.effectiveType === '3g') {
      optimizations.imageQuality = 'medium';
    }

    // Respect data saver mode
    if (connection.saveData) {
      optimizations.imageQuality = 'low';
      optimizations.animationDuration = 'none';
      optimizations.preloadContent = false;
      optimizations.enableLazyLoading = true;
    }

    return optimizations;
  }, [capabilities.networkSupport]);

  // Haptic feedback for supported actions
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification') => {
    // Try Web Haptics API first (experimental)
    if ('haptics' in navigator) {
      try {
        (navigator as any).haptics.vibrate({
          type,
          duration: type === 'light' ? 10 : type === 'medium' ? 25 : 50
        });
        return;
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }

    // Fallback to vibration
    const patterns = {
      light: [10],
      medium: [25],
      heavy: [50],
      selection: [5],
      impact: [30],
      notification: [25, 15, 25]
    };

    vibrate(type === 'selection' ? 'tap' : 
            type === 'notification' ? 'notification' : 'tap');
  }, [vibrate]);

  return {
    capabilities,
    deviceInfo,
    gestureConfig,
    vibrate,
    createGestureDetector,
    enableMotionSensors,
    getAdaptiveStyles,
    getNetworkOptimizations,
    hapticFeedback
  };
}

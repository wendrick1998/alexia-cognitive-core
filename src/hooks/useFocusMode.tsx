
import { useState, useEffect, useCallback } from 'react';

export function useFocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Triple tap detection
  const handleTripleTap = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;

    if (timeDiff < 300) { // Within 300ms
      setTapCount(prev => prev + 1);
    } else {
      setTapCount(1);
    }

    setLastTapTime(now);
  }, [lastTapTime]);

  // Activate focus mode on triple tap
  useEffect(() => {
    if (tapCount >= 3) {
      setIsActive(true);
      setTapCount(0);
    }

    // Reset tap count after delay
    const timer = setTimeout(() => {
      setTapCount(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [tapCount]);

  // Global triple-tap listener
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only trigger on background clicks, not on interactive elements
      const target = e.target as HTMLElement;
      if (!target.closest('button, input, textarea, [role="button"]')) {
        handleTripleTap();
      }
    };

    if (!isActive) {
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isActive, handleTripleTap]);

  const activateFocusMode = useCallback(() => {
    setIsActive(true);
  }, []);

  const deactivateFocusMode = useCallback(() => {
    setIsActive(false);
    setTapCount(0);
  }, []);

  return {
    isActive,
    activateFocusMode,
    deactivateFocusMode,
    tapCount // For debugging
  };
}

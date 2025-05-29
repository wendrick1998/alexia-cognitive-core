
import { useRef, useEffect, useCallback } from 'react';

interface UseAutoScrollOptions {
  dependency: any[];
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  delay?: number;
}

export const useAutoScroll = ({
  dependency,
  behavior = 'smooth',
  block = 'end',
  delay = 100
}: UseAutoScrollOptions) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    if (isScrolling.current) return;
    
    const element = scrollRef.current;
    if (!element) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    isScrolling.current = true;
    
    timeoutRef.current = setTimeout(() => {
      try {
        element.scrollIntoView({ 
          behavior, 
          block,
          inline: 'nearest'
        });
      } catch (error) {
        console.warn('Scroll error:', error);
      }
      
      // Reset scrolling flag
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }, delay);
  }, [behavior, block, delay]);

  useEffect(() => {
    scrollToBottom();
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependency);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scrollRef, scrollToBottom };
};


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

  const scrollToBottom = useCallback(() => {
    if (isScrolling.current) return;
    
    const element = scrollRef.current;
    if (!element) return;

    isScrolling.current = true;
    
    setTimeout(() => {
      element.scrollIntoView({ 
        behavior, 
        block,
        inline: 'nearest'
      });
      
      setTimeout(() => {
        isScrolling.current = false;
      }, 300);
    }, delay);
  }, [behavior, block, delay]);

  useEffect(() => {
    scrollToBottom();
  }, dependency);

  return { scrollRef, scrollToBottom };
};

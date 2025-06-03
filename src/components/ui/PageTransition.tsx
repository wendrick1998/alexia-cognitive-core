
/**
 * @description Componente de transição de página otimizada
 * @created_by Performance Optimization Sprint
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptimizedAnimation } from '@/hooks/useOptimizedAnimation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  key?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '',
  key 
}) => {
  const { shouldAnimate, getAnimationDuration } = useOptimizedAnimation();

  const variants = {
    initial: {
      opacity: 0,
      y: shouldAnimate ? 10 : 0,
      scale: shouldAnimate ? 0.98 : 1
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      y: shouldAnimate ? -10 : 0,
      scale: shouldAnimate ? 0.98 : 1
    }
  };

  const transition = {
    duration: getAnimationDuration(0.3),
    ease: 'easeInOut'
  };

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;


import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  gradient?: boolean;
  glassEffect?: boolean;
  delay?: number;
}

const ResponsiveCard = ({
  children,
  hover = true,
  gradient = false,
  glassEffect = false,
  delay = 0,
  className,
  ...props
}: ResponsiveCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      className="h-full"
    >
      <Card
        className={cn(
          'relative transition-all duration-300 h-full',
          hover && 'hover:shadow-xl hover:shadow-blue-500/10',
          gradient && 'bg-gradient-to-br from-gray-900 to-gray-800',
          glassEffect && 'backdrop-blur-xl bg-white/5 border-white/10',
          'border-gray-200/50 dark:border-gray-700/50',
          className
        )}
        {...props}
      >
        {/* Glow effect on hover */}
        {hover && (
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 blur"
            whileHover={{ opacity: 0.1 }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: -1 }}
          />
        )}
        
        {children}
      </Card>
    </motion.div>
  );
};

export default ResponsiveCard;

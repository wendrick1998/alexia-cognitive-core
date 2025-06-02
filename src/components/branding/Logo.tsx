
import { motion } from 'framer-motion';
import { useDarkMode } from '@/hooks/useDarkMode';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const Logo = ({ size = 'md', animate = true, className = '' }: LogoProps) => {
  const { isDark, isOled } = useDarkMode();

  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-24 h-24 text-5xl'
  };

  const gradientClass = isOled 
    ? 'from-white via-blue-200 to-indigo-300'
    : isDark 
    ? 'from-blue-400 via-indigo-500 to-purple-600'
    : 'from-blue-600 via-indigo-600 to-purple-700';

  return (
    <motion.div
      className={`${sizes[size]} ${className} flex items-center justify-center relative`}
      initial={animate ? { scale: 0, rotate: -180 } : {}}
      animate={animate ? { scale: 1, rotate: 0 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: 0.1 
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Simplified background glow - removed to avoid duplication */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-2xl opacity-15 blur-lg`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Single clean logo text - removed duplication */}
      <div className={`relative z-10 font-bold ${sizes[size].split(' ')[2]} bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent select-none`}>
        <motion.span
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="inline-block"
        >
          A
        </motion.span>
        <motion.span
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="italic inline-block ml-1"
        >
          i
        </motion.span>
      </div>

      {/* Single subtle sparkle - positioned to avoid text overlap */}
      <motion.div
        className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/60 rounded-full"
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: 1.5
        }}
      />
    </motion.div>
  );
};

export default Logo;

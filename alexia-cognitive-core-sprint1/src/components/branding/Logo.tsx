
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
      {/* Background glow */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-2xl opacity-20 blur-xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main logo */}
      <div className={`relative z-10 font-bold ${sizes[size].split(' ')[2]} bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent`}>
        <motion.span
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          A
        </motion.span>
        <motion.span
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="italic"
        >
          i
        </motion.span>
      </div>

      {/* Subtle sparkle effect */}
      <motion.div
        className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-60"
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1
        }}
      />
    </motion.div>
  );
};

export default Logo;

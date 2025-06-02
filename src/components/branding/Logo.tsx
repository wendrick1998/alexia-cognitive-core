
import { Brain } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export default function Logo({ size = 'md', animate = false }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center gap-2">
      <Brain 
        className={`${sizeClasses[size]} text-blue-500 ${animate ? 'animate-pulse' : ''}`} 
      />
      <span className={`font-bold text-white ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-base'}`}>
        Alex iA
      </span>
    </div>
  );
}

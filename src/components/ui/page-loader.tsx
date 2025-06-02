
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  className?: string;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PageLoader = ({ 
  className, 
  text = "Carregando Alex IA...", 
  size = 'md' 
}: PageLoaderProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] gap-4",
      className
    )}>
      <div className="relative">
        <div className={cn(
          "bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse",
          sizeClasses[size]
        )}>
          <Brain className={cn(
            "text-white",
            size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'
          )} />
        </div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20"></div>
      </div>
      
      <div className="text-center space-y-2">
        <p className={cn(
          "font-medium text-white/90",
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        )}>
          {text}
        </p>
        <div className="flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "bg-blue-400 rounded-full animate-bounce",
                size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2'
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const FullPageLoader = ({ text }: { text?: string }) => (
  <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
    <PageLoader text={text} size="lg" />
  </div>
);


import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { Brain, Database, FileText, MessageSquare, Search } from 'lucide-react';

interface SmartLoadingSpinnerProps {
  type?: 'general' | 'database' | 'document' | 'chat' | 'search' | 'brain';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SmartLoadingSpinner = ({ 
  type = 'general',
  message,
  size = 'lg',
  className 
}: SmartLoadingSpinnerProps) => {
  const getIcon = () => {
    switch (type) {
      case 'database':
        return <Database className="w-6 h-6 text-primary" />;
      case 'document':
        return <FileText className="w-6 h-6 text-primary" />;
      case 'chat':
        return <MessageSquare className="w-6 h-6 text-primary" />;
      case 'search':
        return <Search className="w-6 h-6 text-primary" />;
      case 'brain':
        return <Brain className="w-6 h-6 text-primary" />;
      default:
        return null;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'database':
        return 'Conectando ao banco de dados...';
      case 'document':
        return 'Processando documento...';
      case 'chat':
        return 'Carregando conversa...';
      case 'search':
        return 'Buscando resultados...';
      case 'brain':
        return 'Processando sistema cognitivo...';
      default:
        return 'Carregando...';
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
      <div className="relative">
        <LoadingSpinner size={size} />
        {getIcon() && (
          <div className="absolute inset-0 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          {message || getDefaultMessage()}
        </p>
        <p className="text-xs text-muted-foreground">
          Aguarde enquanto processamos sua solicitação
        </p>
      </div>
    </div>
  );
};

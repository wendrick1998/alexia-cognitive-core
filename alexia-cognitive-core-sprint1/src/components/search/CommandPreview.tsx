
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Brain, FileText, Zap, ExternalLink, Copy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPreviewProps {
  result: {
    id: string;
    title: string;
    content: string;
    type: 'conversation' | 'memory' | 'document' | 'action';
    similarity?: number;
    timestamp?: string;
    preview?: string;
  };
}

const CommandPreview = ({ result }: CommandPreviewProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageCircle className="w-5 h-5" />;
      case 'memory':
        return <Brain className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'action':
        return <Zap className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'text-green-400 bg-green-500/20';
      case 'memory':
        return 'text-purple-400 bg-purple-500/20';
      case 'document':
        return 'text-blue-400 bg-blue-500/20';
      case 'action':
        return 'text-orange-400 bg-orange-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(result.content);
        break;
      case 'open':
        // Handle opening the result
        break;
      case 'star':
        // Handle starring the result
        break;
    }
  };

  return (
    <div className="w-80 p-4 border-l border-white/10">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", getTypeColor(result.type))}>
            {getTypeIcon(result.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
              {result.title}
            </h3>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-white/10 text-white/60 border-none capitalize">
                {result.type}
              </Badge>
              
              {result.similarity && (
                <Badge variant="secondary" className="text-xs bg-white/10 text-white/60 border-none">
                  {Math.round(result.similarity * 100)}% match
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">
              Conteúdo
            </h4>
            <p className="text-white/80 text-sm leading-relaxed">
              {result.preview || result.content}
            </p>
          </div>

          {result.timestamp && (
            <div>
              <h4 className="text-xs font-medium text-white/60 uppercase tracking-wide mb-1">
                Data
              </h4>
              <p className="text-white/60 text-sm">
                {result.timestamp}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-white/60 uppercase tracking-wide">
            Ações Rápidas
          </h4>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('open')}
              className="flex-1 text-white/60 hover:text-white hover:bg-white/10 text-xs h-8"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Abrir
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('copy')}
              className="flex-1 text-white/60 hover:text-white hover:bg-white/10 text-xs h-8"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('star')}
              className="flex-1 text-white/60 hover:text-white hover:bg-white/10 text-xs h-8"
            >
              <Star className="w-3 h-3 mr-1" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Context */}
        {result.type === 'document' && (
          <div className="p-3 bg-white/5 rounded-lg">
            <h4 className="text-xs font-medium text-white/60 mb-1">
              Contexto
            </h4>
            <p className="text-white/60 text-xs">
              Este documento foi processado e indexado para busca semântica
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPreview;

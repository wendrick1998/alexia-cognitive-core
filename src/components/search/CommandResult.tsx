
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Brain, FileText, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandResultProps {
  result: {
    id: string;
    title: string;
    content: string;
    type: 'conversation' | 'memory' | 'document' | 'action';
    similarity?: number;
    timestamp?: string;
  };
  isSelected: boolean;
  onClick: () => void;
  shortcut?: string;
}

const CommandResult = ({ result, isSelected, onClick, shortcut }: CommandResultProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageCircle className="w-4 h-4" />;
      case 'memory':
        return <Brain className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'action':
        return <Zap className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'text-green-400';
      case 'memory':
        return 'text-purple-400';
      case 'document':
        return 'text-blue-400';
      case 'action':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRelevanceScore = () => {
    if (!result.similarity) return '';
    return `${Math.round(result.similarity * 100)}%`;
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-3 mx-1 rounded-lg cursor-pointer transition-all duration-200",
        isSelected 
          ? "bg-white/10 backdrop-blur-sm" 
          : "hover:bg-white/5"
      )}
      onClick={onClick}
    >
      {/* Type Icon */}
      <div className={cn("flex-shrink-0", getTypeColor(result.type))}>
        {getTypeIcon(result.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-white truncate text-sm">
            {result.title}
          </h3>
          {result.similarity && (
            <Badge variant="secondary" className="text-xs bg-white/10 text-white/60 border-none">
              {getRelevanceScore()}
            </Badge>
          )}
        </div>
        
        <p className="text-white/60 text-xs line-clamp-1">
          {result.content}
        </p>
        
        {result.timestamp && (
          <span className="text-white/40 text-xs">
            {result.timestamp}
          </span>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {shortcut && (
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/60 min-w-6 text-center">
            {shortcut}
          </kbd>
        )}
        
        <ArrowRight 
          className={cn(
            "w-4 h-4 text-white/40 transition-all duration-200",
            isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
          )} 
        />
      </div>
    </div>
  );
};

export default CommandResult;

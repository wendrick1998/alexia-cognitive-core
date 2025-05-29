
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileText, Brain, Copy, Link, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResultCardProps {
  result: any;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  query: string;
}

const SearchResultCard = ({ 
  result, 
  isHovered, 
  onHover, 
  onLeave, 
  query 
}: SearchResultCardProps) => {
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'semantic':
        return <Brain className="w-4 h-4 text-purple-600" />;
      case 'hybrid':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'semantic':
        return 'bg-purple-100 text-purple-800';
      case 'hybrid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900">
          {part}
        </mark>
      ) : part
    );
  };

  const getRelevanceScore = (result: any) => {
    const score = result.similarity_score || result.combined_score || result.relevance_score || 0;
    return Math.round(score * 100);
  };

  const getRelevanceBars = (score: number) => {
    const bars = 5;
    const filledBars = Math.ceil((score / 100) * bars);
    
    return (
      <div className="flex gap-1">
        {Array.from({ length: bars }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 h-3 rounded-full",
              i < filledBars 
                ? score >= 80 ? "bg-green-500" 
                  : score >= 60 ? "bg-yellow-500" 
                  : "bg-red-500"
                : "bg-gray-200"
            )}
          />
        ))}
      </div>
    );
  };

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Action: ${action} on result:`, result.title || result.content?.substring(0, 50));
    
    switch (action) {
      case 'chat':
        // Navigate to chat with context
        break;
      case 'copy':
        navigator.clipboard.writeText(result.content);
        break;
      case 'connect':
        // Show connections
        break;
      case 'star':
        // Add to favorites
        break;
    }
  };

  return (
    <div
      className={cn(
        "group p-4 rounded-lg border transition-all duration-200 cursor-pointer",
        isHovered 
          ? "bg-blue-50 border-blue-200 shadow-md" 
          : "bg-white border-gray-200 hover:bg-gray-50"
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon(result.type)}
            <Badge variant="secondary" className={getTypeColor(result.type)}>
              {result.source || result.type}
            </Badge>
            <div className="flex items-center gap-1">
              {getRelevanceBars(getRelevanceScore(result))}
              <span className="text-xs text-gray-500 ml-1">
                {getRelevanceScore(result)}%
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {highlightText(
              result.title || result.document_name || 'Resultado da busca',
              query
            )}
          </h3>

          {/* Content Preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {highlightText(result.content.substring(0, 120) + '...', query)}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{result.timestamp ? new Date(result.timestamp).toLocaleDateString() : 'Recente'}</span>
            {result.chunk_index !== undefined && (
              <>
                <span>•</span>
                <span>Trecho {result.chunk_index + 1}</span>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "flex items-center gap-1 ml-4 transition-opacity duration-200",
          isHovered || "opacity-0 group-hover:opacity-100"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={(e) => handleAction('chat', e)}
            title="Conversar sobre"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={(e) => handleAction('copy', e)}
            title="Copiar"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={(e) => handleAction('connect', e)}
            title="Ver conexões"
          >
            <Link className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={(e) => handleAction('star', e)}
            title="Favoritar"
          >
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Instant Preview on Hover */}
      {isHovered && result.content.length > 200 && (
        <div className="mt-3 p-3 bg-white rounded border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">
            {highlightText(result.content.substring(0, 300) + '...', query)}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResultCard;

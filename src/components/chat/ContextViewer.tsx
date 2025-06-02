
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, FileText, MessageSquare, Brain, ExternalLink } from 'lucide-react';
import { ContextNode } from '@/hooks/useContextThread';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContextViewerProps {
  contexts: ContextNode[];
  documentsUsed?: any[];
  className?: string;
}

const ContextViewer = ({ contexts, documentsUsed = [], className }: ContextViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (contexts.length === 0 && documentsUsed.length === 0) return null;

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="w-3 h-3" />;
      case 'document':
        return <FileText className="w-3 h-3" />;
      default:
        return <Brain className="w-3 h-3" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-xs text-gray-600 hover:bg-gray-50"
        >
          <span>Ver contexto utilizado ({contexts.length + documentsUsed.length})</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2 mt-2">
        {/* Cognitive Context */}
        {contexts.map((context) => (
          <Card key={context.node_id} className="p-3 bg-blue-50/50 border-blue-200/50">
            <div className="flex items-start gap-2">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                {getNodeTypeIcon(context.node_type)}
                <span className="text-xs font-medium text-gray-800 truncate">
                  {context.title || 'Contexto Cognitivo'}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getConfidenceColor(context.global_confidence)}`}
                >
                  {Math.round(context.global_confidence * 100)}%
                </Badge>
                {context.is_sensitive && (
                  <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                    Sensível
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {context.content.substring(0, 120)}...
            </p>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>
                {formatDistanceToNow(new Date(context.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
              <span>Posição: {context.context_position}</span>
            </div>
          </Card>
        ))}

        {/* Document Context */}
        {documentsUsed.map((doc, index) => (
          <Card key={index} className="p-3 bg-green-50/50 border-green-200/50">
            <div className="flex items-start gap-2">
              <FileText className="w-3 h-3 text-green-600 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-800 truncate">
                    {doc.document_name || 'Documento'}
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                    {Math.round((doc.similarity || 0) * 100)}% similar
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {doc.content.substring(0, 120)}...
                </p>
              </div>
            </div>
          </Card>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ContextViewer;

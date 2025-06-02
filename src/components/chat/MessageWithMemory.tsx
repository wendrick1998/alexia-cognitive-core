
import { Message } from '@/hooks/useConversations';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MemoryIndicator from './MemoryIndicator';
import ContextViewer from './ContextViewer';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';

interface MessageWithMemoryProps {
  message: Message;
  memoryData?: IntegratedMemoryResponse;
  renderExtras?: (message: Message) => React.ReactNode;
}

const MessageWithMemory = ({ message, memoryData, renderExtras }: MessageWithMemoryProps) => {
  const isUser = message.role === 'user';
  const timestamp = formatDistanceToNow(new Date(message.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <div className={cn(
      "flex items-start gap-3 max-w-[85%] mb-6",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "text-white text-sm",
          isUser 
            ? "bg-gradient-to-br from-blue-500 to-blue-600" 
            : "bg-gradient-to-br from-purple-600 to-indigo-700"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <Card className={cn(
          "p-4 relative",
          isUser
            ? "bg-blue-500 text-white ml-auto"
            : "bg-white border border-gray-200 mr-auto"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          
          <div className={cn(
            "mt-2 text-xs opacity-70",
            isUser ? "text-blue-100" : "text-gray-500"
          )}>
            {timestamp}
          </div>
        </Card>

        {/* Memory Indicators for Assistant Messages */}
        {!isUser && memoryData && (
          <>
            <MemoryIndicator
              memoryUsed={memoryData.context_used}
              confidenceScore={memoryData.confidence_score}
              contextsFound={memoryData.contexts_found}
              validationStatus={memoryData.validation_status}
            />
            
            <ContextViewer
              contexts={memoryData.cognitive_contexts}
              documentsUsed={memoryData.document_contexts}
            />
          </>
        )}

        {/* Extra components (like ResponseSource) */}
        {renderExtras && renderExtras(message)}
      </div>
    </div>
  );
};

export default MessageWithMemory;

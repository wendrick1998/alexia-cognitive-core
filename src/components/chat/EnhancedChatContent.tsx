
import React, { useRef, useEffect } from 'react';
import { Conversation, Message } from '@/hooks/useConversations';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConfidenceIndicator from './ConfidenceIndicator';

interface EnhancedChatContentProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  isNavigating?: boolean;
  memoryDataMap?: Map<string, IntegratedMemoryResponse>;
  renderMessageExtras?: (message: Message) => React.ReactNode;
}

const EnhancedChatContent: React.FC<EnhancedChatContentProps> = ({
  currentConversation,
  messages,
  processing,
  isNavigating = false,
  memoryDataMap = new Map(),
  renderMessageExtras
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length]);

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const isLastMessage = index === messages.length - 1;
    const memoryData = memoryDataMap.get(message.id);

    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 p-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={cn(
            "text-xs",
            isUser ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
          )}>
            {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className={cn(
          "flex-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Message Bubble */}
          <div className={cn(
            "rounded-lg px-4 py-2 break-words",
            isUser 
              ? "bg-blue-600 text-white ml-auto" 
              : "bg-white border border-gray-200 text-gray-900"
          )}>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>

          {/* Timestamp */}
          <div className={cn(
            "text-xs text-gray-500 mt-1",
            isUser ? "text-right" : "text-left"
          )}>
            {formatDistanceToNow(new Date(message.created_at), { 
              addSuffix: true,
              locale: ptBR 
            })}
          </div>

          {/* Memory Indicator for AI responses */}
          {!isUser && memoryData && (
            <ConfidenceIndicator
              confidenceScore={memoryData.confidence_score}
              contextsUsed={memoryData.contexts_found}
              validationStatus={memoryData.validation_status}
              memoryNodes={memoryData.cognitive_contexts}
              className="mt-2"
            />
          )}

          {/* Extra content (like ResponseSource) */}
          {renderMessageExtras && renderMessageExtras(message)}
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Olá! Como posso ajudá-lo hoje?
          </h3>
          <p className="text-gray-600">
            Faça uma pergunta ou inicie uma conversa. Minha memória cognitiva está ativa e pronta para fornecer respostas contextuais precisas.
          </p>
        </div>
      </div>
    </div>
  );

  const renderLoadingMessage = () => (
    <div className="flex gap-3 p-4">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="bg-purple-100 text-purple-700">
          <Sparkles className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-sm text-gray-600">
              Processando com memória cognitiva...
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isNavigating) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1">
        <div className="min-h-full flex flex-col">
          {messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="flex-1 space-y-1">
              {messages.map((message, index) => renderMessage(message, index))}
              {processing && renderLoadingMessage()}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedChatContent;


import { Message } from '@/hooks/useConversations';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import { Avatar } from '@/components/ui/avatar';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  memoryData?: IntegratedMemoryResponse;
}

const ChatMessage = ({ message, isLast = false, memoryData }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className={cn(
      "group flex items-start space-x-3 transition-all duration-200",
      isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
          : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/20"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Mensagem */}
      <div className={cn(
        "flex-1 max-w-[80%] min-w-0",
        isUser ? "flex justify-end" : "flex justify-start"
      )}>
        <div className={cn(
          "relative rounded-2xl px-4 py-3 shadow-sm border transition-all duration-200 group-hover:shadow-md",
          isUser 
            ? "bg-primary text-primary-foreground border-primary/20" 
            : "bg-background/80 backdrop-blur-sm text-foreground border-border/50 hover:bg-background/90"
        )}>
          {/* Conteúdo da mensagem */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* Metadados - apenas se existirem e for assistente */}
          {message.metadata && isAssistant && (
            <div className="mt-3 pt-2 border-t border-border/30">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {message.metadata.fromCache && (
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-md">
                    Cache
                  </span>
                )}
                {message.metadata.usedFallback && (
                  <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded-md">
                    Fallback
                  </span>
                )}
                {message.metadata.responseTime && (
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md">
                    {message.metadata.responseTime}ms
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botão de copiar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={cn(
              "absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isUser 
                ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

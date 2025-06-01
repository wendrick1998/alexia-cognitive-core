
import { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Bot, User, Brain, Clock } from "lucide-react";
import { Message } from "@/hooks/useConversations";
import MarkdownRenderer from "../premium/MarkdownRenderer";
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

const MessageBubble = memo(({ message, isLast }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  
  const timestamp = new Date(message.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={cn(
        "flex items-end gap-3 max-w-[85%] mb-4 animate-fade-in",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
        isLast && "mb-6"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
        isUser 
          ? "bg-gradient-to-br from-blue-500 to-blue-600" 
          : "bg-gradient-to-br from-gray-700 to-gray-800"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-sm relative",
            "transition-all duration-200 hover:shadow-md",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md"
          )}
        >
          {/* Content */}
          <div className="break-words">
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <MarkdownRenderer 
                content={message.content} 
                className={cn(
                  "prose prose-sm max-w-none",
                  "dark:prose-invert",
                  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                )}
              />
            )}
          </div>

          {/* Tail for speech bubble effect */}
          <div
            className={cn(
              "absolute bottom-0 w-3 h-3",
              isUser
                ? "right-0 translate-x-1 bg-blue-600 transform rotate-45"
                : "left-0 -translate-x-1 bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-700 transform rotate-45"
            )}
          />
        </div>

        {/* Timestamp and metadata */}
        <div className={cn(
          "flex items-center gap-2 px-2",
          isUser ? "justify-end" : "justify-start"
        )}>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
          
          {!isUser && message.llm_used && (
            <Badge variant="outline" className="text-xs py-0 px-2 h-5">
              <Brain className="w-3 h-3 mr-1" />
              {message.llm_used}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;

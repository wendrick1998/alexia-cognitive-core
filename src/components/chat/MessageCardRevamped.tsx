
import { Badge } from "@/components/ui/badge";
import { Bot, User, Brain, FileText, Sparkles, Clock } from "lucide-react";
import { Message } from "@/hooks/useConversations";
import MarkdownRenderer from "../premium/MarkdownRenderer";

interface MessageCardRevampedProps {
  message: Message;
  index: number;
}

const MessageCardRevamped = ({ message, index }: MessageCardRevampedProps) => {
  const isUser = message.role === "user";
  const timestamp = new Date(message.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={`flex items-start space-x-4 max-w-4xl mx-auto mb-6 animate-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {!isUser && (
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
        </div>
      )}
      
      <div className="max-w-2xl space-y-3">
        {/* Message Card Premium */}
        <div
          className={`p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 text-white ml-auto"
              : "bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100"
          }`}
        >
          {/* Conteúdo com suporte a markdown */}
          {isUser ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap font-normal">
              {message.content}
            </p>
          ) : (
            <MarkdownRenderer 
              content={message.content} 
              className={isUser ? "prose-invert" : ""}
            />
          )}
          
          {/* Timestamp Premium */}
          <div className={`flex items-center space-x-2 mt-4 text-xs ${
            isUser ? "text-white/70" : "text-slate-500 dark:text-slate-400"
          }`}>
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
        </div>
        
        {/* AI Badges Premium */}
        {!isUser && message.llm_used && (
          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 text-white border-0 text-xs px-3 py-1 rounded-full shadow-sm">
              <Brain className="w-3 h-3 mr-1" />
              {message.llm_used}
            </Badge>
            <Badge className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-500 dark:to-teal-600 text-white border-0 text-xs px-3 py-1 rounded-full shadow-sm">
              <FileText className="w-3 h-3 mr-1" />
              RAG
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageCardRevamped;

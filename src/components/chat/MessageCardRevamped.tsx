
import { Badge } from "@/components/ui/badge";
import { Bot, User, Brain, FileText, Sparkles, Clock } from "lucide-react";
import { Message } from "@/hooks/useConversations";

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
      className={`flex items-start space-x-4 max-w-4xl mx-auto mb-4 animate-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {!isUser && (
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#0A0A0A]" />
        </div>
      )}
      
      <div className="max-w-2xl space-y-2">
        {/* Message Card */}
        <div
          className={`p-4 rounded-3xl shadow-lg relative overflow-hidden ${
            isUser
              ? "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white ml-auto"
              : "bg-[#1A1A1A] border border-white/10 text-white"
          }`}
        >
          <p className="text-base leading-relaxed whitespace-pre-wrap font-normal">
            {message.content}
          </p>
          
          {/* Timestamp */}
          <div className={`flex items-center space-x-1 mt-3 text-xs ${
            isUser ? "text-white/70" : "text-white/50"
          }`}>
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
        </div>
        
        {/* AI Badges */}
        {!isUser && message.llm_used && (
          <div className="flex items-center gap-2 ml-2">
            <Badge className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white border-0 text-xs px-2 py-1">
              <Brain className="w-3 h-3 mr-1" />
              {message.llm_used}
            </Badge>
            <Badge className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-0 text-xs px-2 py-1">
              <FileText className="w-3 h-3 mr-1" />
              RAG
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/5 backdrop-blur-sm border-white/20 text-white/80 px-2 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageCardRevamped;

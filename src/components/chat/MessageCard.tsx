
import { Badge } from "@/components/ui/badge";
import { Bot, User, Brain, FileText, Sparkles } from "lucide-react";
import { Message } from "@/hooks/useConversations";

interface MessageCardProps {
  message: Message;
  index: number;
}

const MessageCard = ({ message, index }: MessageCardProps) => {
  return (
    <div
      className={`flex items-start space-x-4 max-w-5xl mx-auto animate-fade-in ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {message.role === "assistant" && (
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
      )}
      
      <div className="max-w-3xl space-y-3">
        <div
          className={`px-6 py-4 rounded-3xl shadow-lg relative overflow-hidden ${
            message.role === "user"
              ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white ml-auto shadow-blue-200"
              : "bg-white/90 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-slate-200"
          }`}
        >
          {message.role === "user" && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20" />
          )}
          <div className="relative">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
        
        {message.role === "assistant" && message.llm_used && (
          <div className="flex items-center gap-2 ml-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs">
              <Brain className="w-3 h-3 mr-1" />
              {message.llm_used}
            </Badge>
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 text-xs">
              <FileText className="w-3 h-3 mr-1" />
              RAG
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}
      </div>
      
      {message.role === "user" && (
        <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageCard;

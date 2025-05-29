
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Bot, User, Brain, FileText, Sparkles, Clock } from "lucide-react";
import { Message } from "@/hooks/useConversations";
import MarkdownRenderer from "../premium/MarkdownRenderer";
import ChatMessageActions from './ChatMessageActions';
import MessageEditor from './MessageEditor';
import SyntaxHighlighter from './SyntaxHighlighter';

interface MessageCardRevampedProps {
  message: Message;
  index: number;
}

const MessageCardRevamped = ({ message, index }: MessageCardRevampedProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const isUser = message.role === "user";
  
  const timestamp = new Date(message.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = (newContent: string) => {
    // Aqui você implementaria a lógica para salvar a edição
    console.log('Saving edited message:', newContent);
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    // Aqui você implementaria a lógica para regenerar a resposta
    console.log('Regenerating response for message:', message.id);
  };

  const handleReaction = (emoji: string) => {
    // Aqui você implementaria a lógica para adicionar reação
    console.log('Adding reaction:', emoji, 'to message:', message.id);
  };

  const handlePin = () => {
    // Aqui você implementaria a lógica para fixar mensagem
    console.log('Pinning message:', message.id);
  };

  // Detectar se há código na mensagem
  const hasCode = message.content.includes('```');
  
  const renderContent = () => {
    if (hasCode) {
      // Dividir conteúdo em blocos de texto e código
      const parts = message.content.split(/(```[\s\S]*?```)/g);
      
      return parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3);
          const lines = code.split('\n');
          const language = lines[0].trim() || 'text';
          const codeContent = lines.slice(1).join('\n');
          
          return (
            <SyntaxHighlighter
              key={idx}
              code={codeContent}
              language={language}
              className="my-4"
            />
          );
        }
        
        return part && (
          <MarkdownRenderer 
            key={idx}
            content={part}
            className={isUser ? "prose-invert" : ""}
          />
        );
      });
    }
    
    if (isUser) {
      return (
        <p className="text-base leading-relaxed whitespace-pre-wrap font-normal">
          {message.content}
        </p>
      );
    }
    
    return (
      <MarkdownRenderer 
        content={message.content} 
        className={isUser ? "prose-invert" : ""}
      />
    );
  };

  return (
    <div
      className={`flex items-start space-x-4 max-w-4xl mx-auto mb-6 animate-fade-in relative group ${
        isUser ? "justify-end" : "justify-start"
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {!isUser && (
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F0F0F] shadow-sm" />
        </div>
      )}
      
      <div className="max-w-2xl space-y-3 relative">
        {/* Message Card Premium */}
        <div
          className={`p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
            isUser
              ? "bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white ml-auto"
              : "bg-[#1A1A1A] border border-white/10 text-white"
          }`}
        >
          {/* Message Actions */}
          <ChatMessageActions
            message={message}
            onRegenerate={!isUser ? handleRegenerate : undefined}
            onEdit={handleEdit}
            onPin={handlePin}
            onReaction={handleReaction}
          />
          
          {/* Conteúdo */}
          {isEditing ? (
            <MessageEditor
              initialContent={message.content}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-3">
              {renderContent()}
            </div>
          )}
          
          {/* Timestamp Premium */}
          <div className={`flex items-center space-x-2 mt-4 text-xs ${
            isUser ? "text-white/70" : "text-white/50"
          }`}>
            <Clock className="w-3 h-3" />
            <span className="font-mono">{timestamp}</span>
          </div>
          
          {/* Gradient border effect */}
          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
            isUser 
              ? "bg-gradient-to-br from-blue-400/20 via-blue-500/20 to-purple-500/20" 
              : "bg-gradient-to-br from-white/5 via-white/10 to-white/5"
          }`} />
        </div>
        
        {/* AI Badges Premium */}
        {!isUser && message.llm_used && (
          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <Badge className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white border-0 text-xs px-3 py-1 rounded-full shadow-sm">
              <Brain className="w-3 h-3 mr-1" />
              {message.llm_used}
            </Badge>
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 text-xs px-3 py-1 rounded-full shadow-sm">
              <FileText className="w-3 h-3 mr-1" />
              RAG
            </Badge>
            <Badge variant="outline" className="text-xs bg-[#1A1A1A]/80 backdrop-blur-sm border-white/20 text-white/80 px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageCardRevamped;

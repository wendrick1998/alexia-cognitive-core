
import { Bot } from 'lucide-react';

const ChatProcessingIndicator = () => {
  return (
    <div className="flex items-start space-x-4 max-w-5xl mx-auto animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg avatar-thinking">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white animate-pulse" />
      </div>
      <div className="max-w-3xl px-6 py-4 rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/60 text-slate-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-base text-slate-700 font-medium">
            Processando sua pergunta e buscando informações relevantes...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatProcessingIndicator;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { Conversation } from "@/hooks/useConversations";

interface ChatInputProps {
  processing: boolean;
  currentConversation: Conversation | null;
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

const ChatInput = ({ 
  processing, 
  currentConversation, 
  onSendMessage, 
  placeholder = "Faça uma pergunta sobre seus documentos..." 
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim() || processing) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-indigo-50/30" />
      <div className="max-w-5xl mx-auto relative">
        <div className="flex space-x-4 items-end">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="pr-4 py-4 text-base rounded-2xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/90 backdrop-blur-sm shadow-lg text-slate-800 placeholder:text-slate-500"
              disabled={processing}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || processing}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl border-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {currentConversation && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Suas perguntas serão respondidas com base nos documentos processados usando busca semântica e IA premium
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;

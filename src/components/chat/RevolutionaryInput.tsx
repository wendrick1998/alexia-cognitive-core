
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface RevolutionaryInputProps {
  processing: boolean;
  onSendMessage: (message: string) => void;
  contextualPlaceholder?: string;
  aiTyping?: boolean;
}

const RevolutionaryInput = ({ 
  processing, 
  onSendMessage, 
  contextualPlaceholder = "Digite sua mensagem...",
  aiTyping = false
}: RevolutionaryInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  return (
    <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* AI Typing Indicator */}
        {aiTyping && (
          <div className="mb-3 flex items-center space-x-2 text-white/60 text-sm">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Alex iA está digitando...</span>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={contextualPlaceholder}
              className="min-h-[48px] max-h-[120px] resize-none bg-[#1A1A1A] border-white/10 focus:border-[#6366F1] text-white placeholder:text-white/40 text-base leading-relaxed rounded-2xl px-4 py-3 pr-12"
              disabled={processing}
              rows={2}
            />
            
            {/* Character count or other indicators can go here */}
            <div className="absolute bottom-2 right-2 text-xs text-white/30">
              {inputValue.length > 0 && `${inputValue.length} chars`}
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || processing}
            className="w-[50px] h-[50px] rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B5BF7] hover:to-[#9333EA] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl border-0 flex-shrink-0"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RevolutionaryInput;

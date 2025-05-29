
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Smile,
  X,
  Plus
} from "lucide-react";

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim() || processing) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
    setAttachments([]);
    setShowActions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setShowActions(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const emojis = ['😊', '👍', '❤️', '🔥', '✨', '💡'];

  return (
    <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* AI Typing Indicator */}
        {aiTyping && (
          <div className="mb-3 flex items-center space-x-3 text-white/60 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Alex iA está digitando...</span>
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 group">
                <Paperclip className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white truncate max-w-[120px]" title={file.name}>
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Container */}
        <div className="relative">
          <div className="flex items-end space-x-3">
            {/* Actions Button */}
            <div className="relative">
              <Button
                onClick={() => setShowActions(!showActions)}
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all"
              >
                <Plus className={`w-5 h-5 transition-transform ${showActions ? 'rotate-45' : ''}`} />
              </Button>

              {/* Actions Menu */}
              {showActions && (
                <div className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[200px] shadow-2xl">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Anexar arquivo</span>
                  </button>
                  
                  <div className="border-t border-white/10 my-2"></div>
                  
                  <div className="px-3 py-2">
                    <p className="text-xs text-white/40 mb-2">Emojis rápidos</p>
                    <div className="flex space-x-1">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setInputValue(prev => prev + emoji);
                            setShowActions(false);
                            textareaRef.current?.focus();
                          }}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Text Input */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={contextualPlaceholder}
                className="min-h-[50px] max-h-[120px] resize-none bg-white/5 border-white/10 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/20 text-white placeholder:text-white/40 text-base rounded-2xl px-4 py-3 transition-all"
                disabled={processing}
                rows={1}
              />
            </div>
            
            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || processing}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105 border-0 flex-shrink-0 disabled:opacity-50 disabled:hover:scale-100"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.txt,.doc,.docx,.md"
          />
        </div>
      </div>
    </div>
  );
};

export default RevolutionaryInput;

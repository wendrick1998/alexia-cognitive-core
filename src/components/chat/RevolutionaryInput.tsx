
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Bold, 
  Italic, 
  Code, 
  Link,
  X
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
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim() || processing) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
    setAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      
      if (start !== end) {
        setSelectionRange({ start, end });
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
    }
  };

  const applyFormatting = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = selectionRange.start;
    const end = selectionRange.end;
    const selectedText = inputValue.substring(start, end);
    
    let formattedText = "";
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newValue = inputValue.substring(0, start) + formattedText + inputValue.substring(end);
    setInputValue(newValue);
    setShowToolbar(false);
    
    // Restore focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Token counter (approximate)
  const tokenCount = Math.ceil(inputValue.length / 4);

  return (
    <div 
      className="bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
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

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <Paperclip className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Floating Toolbar */}
        {showToolbar && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#1A1A1A] border border-white/20 rounded-lg p-2 flex items-center space-x-1 shadow-xl z-10">
            <Button
              onClick={() => applyFormatting('bold')}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => applyFormatting('italic')}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => applyFormatting('code')}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => applyFormatting('link')}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10"
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-3 relative">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onSelect={handleTextSelection}
              placeholder={contextualPlaceholder}
              className="min-h-[56px] max-h-[120px] resize-none bg-[#1A1A1A] border-white/10 focus:border-[#6366F1] text-white placeholder:text-white/40 text-base leading-relaxed rounded-2xl px-4 py-4 pr-16"
              disabled={processing}
              rows={1}
            />
            
            {/* Bottom Row: Attach Button and Token Counter */}
            <div className="absolute bottom-2 left-4 right-16 flex items-center justify-between">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              {tokenCount > 0 && (
                <span className="text-xs text-white/30">
                  ~{tokenCount} tokens
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.doc,.docx"
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || processing}
            className="w-[56px] h-[56px] rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B5BF7] hover:to-[#9333EA] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl border-0 flex-shrink-0"
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

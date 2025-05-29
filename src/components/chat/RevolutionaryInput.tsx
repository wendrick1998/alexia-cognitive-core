
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
  X,
  Smile,
  AtSign
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
  const [showEmojis, setShowEmojis] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
        formattedText = selectedText.includes('\n') ? `\`\`\`\n${selectedText}\n\`\`\`` : `\`${selectedText}\``;
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
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  // Token counter (approximate)
  const tokenCount = Math.ceil(inputValue.length / 4);
  const emojis = ['😊', '🤔', '👍', '❤️', '🔥', '✨', '💡', '🚀', '🎯', '💪'];

  return (
    <div 
      className={`bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 p-4 relative ${
        isDragging ? 'bg-blue-500/10 border-blue-400/50' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg border-2 border-dashed border-blue-400/50">
          <div className="text-center">
            <Paperclip className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">Solte os arquivos aqui</p>
            <p className="text-white/60 text-sm">Imagens, PDFs e documentos</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* AI Typing Indicator Premium */}
        {aiTyping && (
          <div className="mb-4 flex items-center space-x-3 text-white/60 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="font-medium">Alex iA está digitando...</span>
          </div>
        )}

        {/* Attachments Premium */}
        {attachments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-[#1A1A1A] border border-white/20 rounded-xl px-3 py-2 group hover:bg-white/5 transition-colors">
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

        {/* Floating Toolbar Premium */}
        {showToolbar && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-[#1A1A1A] border border-white/20 rounded-xl p-2 flex items-center space-x-1 shadow-2xl z-30 backdrop-blur-sm">
            <Button
              onClick={() => applyFormatting('bold')}
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => applyFormatting('italic')}
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => applyFormatting('code')}
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => applyFormatting('link')}
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
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
              className="min-h-[60px] max-h-[150px] resize-none bg-[#1A1A1A] border-white/10 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-white placeholder:text-white/40 text-base leading-relaxed rounded-2xl px-4 py-4 pr-24 transition-all"
              disabled={processing}
              rows={1}
            />
            
            {/* Bottom Toolbar */}
            <div className="absolute bottom-3 left-4 right-20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="sm"
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="relative">
                  <Button
                    onClick={() => setShowEmojis(!showEmojis)}
                    variant="ghost"
                    size="sm"
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  
                  {showEmojis && (
                    <div className="absolute bottom-full left-0 mb-2 bg-[#1A1A1A] border border-white/20 rounded-lg p-2 flex space-x-1 shadow-xl">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setInputValue(prev => prev + emoji);
                            setShowEmojis(false);
                            textareaRef.current?.focus();
                          }}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {tokenCount > 0 && (
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`font-mono ${
                    tokenCount > 4000 ? 'text-red-400' : 
                    tokenCount > 3000 ? 'text-yellow-400' : 
                    'text-white/30'
                  }`}>
                    ~{tokenCount.toLocaleString()} tokens
                  </span>
                </div>
              )}
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
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || processing}
            className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl border-0 flex-shrink-0"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </Button>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="mt-3 text-center">
          <p className="text-xs text-white/30">
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">Enter</kbd> para enviar • 
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono mx-1">Shift + Enter</kbd> para nova linha • 
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">⌘ + K</kbd> para buscar
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevolutionaryInput;

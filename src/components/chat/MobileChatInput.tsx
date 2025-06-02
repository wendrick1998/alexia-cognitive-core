
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileSafeArea } from '@/hooks/useMobileSafeArea';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface MobileChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  processing: boolean;
  placeholder?: string;
}

const MobileChatInput = ({
  message,
  onMessageChange,
  onSendMessage,
  processing,
  placeholder = "Digite sua mensagem..."
}: MobileChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { getInputAreaStyles, config } = useMobileSafeArea();
  const { hapticFeedback } = useMobileOptimization();

  const inputAreaStyles = getInputAreaStyles();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim() || processing) return;
    hapticFeedback('medium');
    onSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    hapticFeedback('light');
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div 
      className={cn(
        "bg-gray-900/95 backdrop-blur-xl border-t border-white/10",
        "transition-all duration-300 ease-out",
        config.isKeyboardOpen && "shadow-2xl"
      )}
      style={inputAreaStyles}
    >
      {/* Keyboard indicator bar for iOS */}
      {config.isKeyboardOpen && (
        <div className="flex justify-center py-1">
          <div className="w-8 h-1 bg-white/20 rounded-full" />
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-end gap-3">
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-white/60 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
            disabled={processing}
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={processing}
              className={cn(
                "min-h-[44px] max-h-[120px] resize-none",
                "bg-white/10 border border-white/20 rounded-2xl px-4 py-3",
                "text-white placeholder:text-white/40",
                "focus:ring-2 focus:ring-blue-400/50 focus:border-transparent",
                "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20",
                "transition-all duration-200",
                isFocused && "bg-white/15 border-white/30"
              )}
              style={{
                fontSize: '16px', // Prevent iOS zoom
                lineHeight: '1.4'
              }}
            />
            
            {/* Character counter for long messages */}
            {message.length > 100 && (
              <div className="absolute -bottom-6 right-2 text-xs text-white/40">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Voice input button */}
          {!message.trim() && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 text-white/60 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
              disabled={processing}
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}

          {/* Send button */}
          {message.trim() && (
            <Button
              onClick={handleSendMessage}
              disabled={processing}
              className={cn(
                "flex-shrink-0 rounded-full w-10 h-10 p-0",
                "bg-blue-500 hover:bg-blue-600 text-white",
                "transition-all duration-200 transform",
                "hover:scale-105 active:scale-95",
                "shadow-lg hover:shadow-xl"
              )}
            >
              <Send className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Quick actions row */}
        {isFocused && !config.isKeyboardOpen && (
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
            {['📝 Resumir', '🔍 Analisar', '💡 Ideia', '❓ Pergunta'].map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="flex-shrink-0 text-xs bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white rounded-full"
                onClick={() => onMessageChange(action.split(' ')[1] + ': ')}
              >
                {action}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileChatInput;


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

  const handleAttachmentClick = () => {
    hapticFeedback('medium');
    // TODO: Implement attachment functionality
  };

  const handleVoiceClick = () => {
    hapticFeedback('medium');
    // TODO: Implement voice recording
  };

  return (
    <div 
      className={cn(
        "bg-gray-900/95 backdrop-blur-xl border-t border-white/10",
        "transition-all duration-300 ease-out mobile-input-area",
        config.isKeyboardOpen && "shadow-2xl"
      )}
      style={inputAreaStyles}
      role="region"
      aria-label="Área de entrada de mensagem"
    >
      {/* Keyboard indicator bar for iOS */}
      {config.isKeyboardOpen && (
        <div className="flex justify-center py-1" aria-hidden="true">
          <div className="w-8 h-1 bg-white/20 rounded-full" />
        </div>
      )}

      <div className={cn("px-4 py-3", config.isKeyboardOpen && "mobile-compact-spacing")}>
        <div className="flex items-end gap-3">
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAttachmentClick}
            disabled={processing}
            aria-label="Anexar arquivo"
            role="button"
            tabIndex={0}
            className={cn(
              "flex-shrink-0 text-white/60 hover:text-white hover:bg-white/10",
              "touch-target-48 rounded-full btn-accessible focus-ring-enhanced",
              processing && "btn-state-disabled"
            )}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
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
              aria-label="Digite sua mensagem"
              aria-describedby={message.length > 100 ? "char-counter" : undefined}
              className={cn(
                "min-h-[44px] max-h-[120px] resize-none",
                "bg-white/10 border border-white/20 rounded-2xl px-4 py-3",
                "text-white placeholder:text-white/40",
                "focus:ring-2 focus:ring-blue-400/50 focus:border-transparent",
                "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20",
                "transition-all duration-200 focus-ring-enhanced",
                isFocused && "bg-white/15 border-white/30",
                processing && "opacity-50"
              )}
              style={{
                fontSize: '16px', // Prevent iOS zoom
                lineHeight: '1.4'
              }}
            />
            
            {/* Character counter for long messages */}
            {message.length > 100 && (
              <div 
                id="char-counter"
                className="absolute -bottom-6 right-2 text-xs text-white/40"
                aria-live="polite"
              >
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Voice input button */}
          {!message.trim() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceClick}
              disabled={processing}
              aria-label="Gravar mensagem de voz"
              role="button"
              tabIndex={0}
              className={cn(
                "flex-shrink-0 text-white/60 hover:text-white hover:bg-white/10",
                "touch-target-48 rounded-full btn-accessible focus-ring-enhanced",
                processing && "btn-state-disabled"
              )}
            >
              <Mic className="w-5 h-5" aria-hidden="true" />
            </Button>
          )}

          {/* Send button */}
          {message.trim() && (
            <Button
              onClick={handleSendMessage}
              disabled={processing}
              aria-label="Enviar mensagem"
              role="button"
              tabIndex={0}
              className={cn(
                "flex-shrink-0 touch-target-48 rounded-full",
                "bg-blue-500 hover:bg-blue-600 text-white",
                "transition-all duration-200 transform btn-accessible focus-ring-enhanced",
                "hover:scale-105 active:scale-95",
                "shadow-lg hover:shadow-xl",
                processing && "btn-state-loading"
              )}
            >
              <Send className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only">
                {processing ? 'Enviando mensagem...' : 'Enviar mensagem'}
              </span>
            </Button>
          )}
        </div>

        {/* Quick actions row */}
        {isFocused && !config.isKeyboardOpen && (
          <div 
            className="flex gap-2 mt-3 overflow-x-auto scrollbar-none"
            role="group"
            aria-label="Ações rápidas"
          >
            {['📝 Resumir', '🔍 Analisar', '💡 Ideia', '❓ Pergunta'].map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                onClick={() => onMessageChange(action.split(' ')[1] + ': ')}
                aria-label={`Inserir ${action}`}
                role="button"
                tabIndex={0}
                className={cn(
                  "flex-shrink-0 text-xs bg-white/5 border-white/20",
                  "text-white/70 hover:bg-white/10 hover:text-white rounded-full",
                  "btn-accessible focus-ring-enhanced mobile-button-compact"
                )}
              >
                {action}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Live region for screen readers */}
      <div
        className="live-region"
        aria-live="polite"
        aria-atomic="true"
      >
        {processing && 'Enviando mensagem...'}
      </div>
    </div>
  );
};

export default MobileChatInput;

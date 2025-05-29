
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Paperclip, Mic, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import MobileKeyboardAccessory from './MobileKeyboardAccessory';

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
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showKeyboardAccessory, setShowKeyboardAccessory] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const { hapticFeedback, deviceInfo, getAdaptiveStyles } = useMobileOptimization();

  const adaptiveStyles = getAdaptiveStyles();

  // Handle input focus for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleFocus = () => {
      setIsFocused(true);
      setShowKeyboardAccessory(true);
      hapticFeedback('light');
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Delay hiding accessory to allow for button taps
      setTimeout(() => {
        setShowKeyboardAccessory(false);
      }, 100);
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      }
    };
  }, [isMobile, hapticFeedback]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, isMobile ? 120 : 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message, isMobile]);

  const handleSend = () => {
    if (!message.trim() || processing) return;
    
    hapticFeedback('medium');
    onSendMessage(message.trim());
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + text + message.slice(end);
    
    setMessage(newMessage);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.setSelectionRange(start + text.length, start + text.length);
      textarea.focus();
    }, 0);
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      hapticFeedback('heavy');
      // Stop recording logic here
    } else {
      setIsRecording(true);
      hapticFeedback('heavy');
      // Start recording logic here
    }
  };

  const handleAttachment = () => {
    hapticFeedback('medium');
    // Open attachment picker
    console.log('Opening attachment picker');
  };

  const handleKeyboardDone = () => {
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
    handleSend();
  };

  const handleKeyboardCancel = () => {
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  return (
    <>
      <div 
        className={cn(
          "relative w-full",
          isMobile && "px-4 py-3",
          !isMobile && "px-6 py-4"
        )}
        style={adaptiveStyles}
      >
        <div className={cn(
          "relative glass-card rounded-2xl transition-all duration-300",
          "bg-white/5 backdrop-blur-xl border border-white/10",
          isFocused && "border-blue-500/30 shadow-lg shadow-blue-500/20",
          processing && "opacity-70"
        )}>
          {/* AI Typing Indicator */}
          {aiTyping && (
            <div className="absolute -top-8 left-4 flex items-center gap-2 text-xs text-white/60">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-150" />
              </div>
              <span>AlexIA está digitando...</span>
            </div>
          )}

          {/* Main Input Area */}
          <div className="flex items-end gap-3 p-4">
            {/* Voice Recording Button (Mobile) */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onTouchStart={() => hapticFeedback('light')}
                onTouchEnd={handleVoiceRecording}
                className={cn(
                  "flex-shrink-0 w-10 h-10 p-0 rounded-xl transition-all duration-200",
                  "touch-manipulation",
                  isRecording 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                disabled={processing}
              >
                {isRecording ? (
                  <StopCircle className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            )}

            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={contextualPlaceholder}
                disabled={processing}
                className={cn(
                  "min-h-[20px] max-h-[120px] resize-none",
                  "bg-transparent border-none p-0 text-white placeholder:text-white/40",
                  "focus:ring-0 focus:outline-none",
                  "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20",
                  isMobile && "text-16px", // Prevent zoom on iOS
                  "text-rendering-optimized"
                )}
                style={{
                  fontSize: isMobile ? '16px' : '14px', // Prevent iOS zoom
                  lineHeight: '1.5',
                  ...adaptiveStyles
                }}
              />
              
              {/* Character count for mobile */}
              {isMobile && message.length > 100 && (
                <div className="absolute -bottom-6 right-0 text-xs text-white/40">
                  {message.length}/2000
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Attachment Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAttachment}
                className={cn(
                  "w-10 h-10 p-0 rounded-xl transition-all duration-200",
                  "touch-manipulation text-white/60 hover:text-white hover:bg-white/10"
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                disabled={processing}
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!message.trim() || processing}
                className={cn(
                  "w-10 h-10 p-0 rounded-xl transition-all duration-200",
                  "touch-manipulation",
                  "bg-gradient-to-r from-blue-500 to-purple-600",
                  "hover:from-blue-600 hover:to-purple-700",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "shadow-lg hover:shadow-xl transform hover:scale-105",
                  message.trim() && !processing && "animate-pulse"
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </Button>
            </div>
          </div>

          {/* Smart suggestions bar (mobile) */}
          {isMobile && isFocused && !message && (
            <div className="px-4 pb-3">
              <div className="flex gap-2 text-xs">
                {['Como posso ajudar?', 'Analise este documento', 'Crie um resumo'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onTouchEnd={() => {
                      hapticFeedback('light');
                      setMessage(suggestion);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full bg-white/10 text-white/70",
                      "touch-manipulation whitespace-nowrap",
                      "hover:bg-white/20 hover:text-white transition-colors"
                    )}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass-card px-4 py-2 rounded-xl">
              <div className="flex items-center gap-3 text-white/80">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="text-sm">Processando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Keyboard Accessory */}
      <MobileKeyboardAccessory
        isVisible={showKeyboardAccessory && isMobile}
        onInsertText={handleInsertText}
        onDone={handleKeyboardDone}
        onCancel={handleKeyboardCancel}
        onAttachment={handleAttachment}
      />
    </>
  );
};

export default RevolutionaryInput;

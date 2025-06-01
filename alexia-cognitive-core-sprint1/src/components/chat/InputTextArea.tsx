
import { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface InputTextAreaProps {
  message: string;
  onMessageChange: (message: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  disabled: boolean;
}

const InputTextArea = ({
  message,
  onMessageChange,
  onKeyPress,
  onFocus,
  onBlur,
  placeholder,
  disabled
}: InputTextAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const { getAdaptiveStyles } = useMobileOptimization();

  const adaptiveStyles = getAdaptiveStyles();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, isMobile ? 120 : 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message, isMobile]);

  // Expose ref to parent for external focus control
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus = () => textareaRef.current?.focus();
      textareaRef.current.blur = () => textareaRef.current?.blur();
      textareaRef.current.setSelectionRange = (start: number, end: number) => 
        textareaRef.current?.setSelectionRange(start, end);
    }
  }, []);

  return (
    <div className="flex-1 relative">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={onKeyPress}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "min-h-[20px] max-h-[120px] resize-none",
          "bg-transparent border-none p-0 text-white placeholder:text-white/40",
          "focus:ring-0 focus:outline-none",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20",
          isMobile && "text-16px",
          "text-rendering-optimized"
        )}
        style={{
          fontSize: isMobile ? '16px' : '14px',
          lineHeight: '1.5',
          ...adaptiveStyles
        }}
      />
      
      {isMobile && message.length > 100 && (
        <div className="absolute -bottom-6 right-0 text-xs text-white/40">
          {message.length}/2000
        </div>
      )}
    </div>
  );
};

export default InputTextArea;

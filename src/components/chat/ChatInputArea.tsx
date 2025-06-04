
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileSafeArea } from '@/hooks/useMobileSafeArea';
import RevolutionaryInput from './RevolutionaryInput';
import { Conversation } from '@/hooks/useConversations';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputAreaProps {
  processing: boolean;
  onSendMessage: (message: string) => void;
  currentConversation: Conversation | null;
}

const ChatInputArea = ({ 
  processing, 
  onSendMessage, 
  currentConversation 
}: ChatInputAreaProps) => {
  const isMobile = useIsMobile();
  const { isIOSPWA } = useMobileSafeArea();
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!message.trim() || processing) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const placeholder = currentConversation 
    ? "Digite sua mensagem..." 
    : "Digite sua primeira mensagem para iniciar uma conversa...";

  // Design premium unificado para mobile e desktop
  return (
    <div className="bg-background/95 backdrop-blur-xl border-t border-border/30 safe-area-bottom">
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            {isMobile || isIOSPWA ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={processing}
                rows={1}
                className="w-full px-4 py-3 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ 
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
            ) : (
              <RevolutionaryInput
                processing={processing}
                onSendMessage={onSendMessage}
                contextualPlaceholder={placeholder}
                aiTyping={processing}
              />
            )}
          </div>
          
          {(isMobile || isIOSPWA) && (
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || processing}
              size="lg"
              className="px-4 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInputArea;

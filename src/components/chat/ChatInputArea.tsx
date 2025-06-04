
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileSafeArea } from '@/hooks/useMobileSafeArea';
import RevolutionaryInput from './RevolutionaryInput';
import { Conversation } from '@/hooks/useConversations';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

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

  // Use mobile-optimized input for iOS PWA and mobile devices
  if (isMobile || isIOSPWA) {
    return (
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={processing}
                rows={1}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50 transition-colors duration-200"
                style={{ minHeight: '48px' }}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || processing}
              size="lg"
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-4xl mx-auto">
        <RevolutionaryInput
          processing={processing}
          onSendMessage={onSendMessage}
          contextualPlaceholder={placeholder}
          aiTyping={processing}
        />
      </div>
    </div>
  );
};

export default ChatInputArea;

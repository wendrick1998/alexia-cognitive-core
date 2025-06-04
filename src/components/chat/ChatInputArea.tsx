
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
      <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 safe-area-bottom">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none disabled:opacity-50 transition-colors duration-200"
                style={{ minHeight: '48px' }}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || processing}
              size="lg"
              className="px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
              style={{ minHeight: '48px', minWidth: '48px' }}
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
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

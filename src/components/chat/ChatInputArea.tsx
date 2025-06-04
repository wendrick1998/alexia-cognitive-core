
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileSafeArea } from '@/hooks/useMobileSafeArea';
import RevolutionaryInput from './RevolutionaryInput';
import MobileChatInput from './MobileChatInput';
import { Conversation } from '@/hooks/useConversations';
import { useState } from 'react';

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

  const placeholder = currentConversation 
    ? "Digite sua mensagem..." 
    : "Digite sua primeira mensagem para iniciar uma conversa...";

  // Use mobile-optimized input for iOS PWA and mobile devices
  if (isMobile || isIOSPWA) {
    return (
      <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="p-4">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={placeholder}
              disabled={processing}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || processing}
              className="px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {processing ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
      <RevolutionaryInput
        processing={processing}
        onSendMessage={onSendMessage}
        contextualPlaceholder={placeholder}
        aiTyping={processing}
      />
    </div>
  );
};

export default ChatInputArea;

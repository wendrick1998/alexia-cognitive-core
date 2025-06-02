
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
      <MobileChatInput
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        processing={processing}
        placeholder={placeholder}
      />
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


import RevolutionaryInput from './RevolutionaryInput';
import { Conversation } from '@/hooks/useConversations';

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
  return (
    <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
      <RevolutionaryInput
        processing={processing}
        onSendMessage={onSendMessage}
        contextualPlaceholder={
          currentConversation 
            ? "Digite sua mensagem..." 
            : "Digite sua primeira mensagem para iniciar uma conversa..."
        }
        aiTyping={processing}
      />
    </div>
  );
};

export default ChatInputArea;

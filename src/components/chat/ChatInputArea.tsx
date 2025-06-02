
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
    <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 pb-safe-area-bottom">
      <div className="p-4">
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
    </div>
  );
};

export default ChatInputArea;

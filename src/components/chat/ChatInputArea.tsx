
import RevolutionaryInput from './RevolutionaryInput';

interface ChatInputAreaProps {
  processing: boolean;
  onSendMessage: (message: string) => void;
  currentConversation: any;
}

const ChatInputArea = ({ 
  processing, 
  onSendMessage, 
  currentConversation 
}: ChatInputAreaProps) => {
  return (
    <div className="flex-shrink-0 sticky bottom-0 z-10">
      {/* Gradient overlay para efeito de fade */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-transparent to-white dark:to-gray-950 pointer-events-none" />
      
      {/* Container do input com backdrop blur premium */}
      <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg">
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

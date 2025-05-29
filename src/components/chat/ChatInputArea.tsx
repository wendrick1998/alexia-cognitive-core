
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
    <div className="glass-card border-t border-white/5 backdrop-blur-xl flex-shrink-0">
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

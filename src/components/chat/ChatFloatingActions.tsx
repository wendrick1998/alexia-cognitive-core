
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingActionButton from './FloatingActionButton';

interface ChatFloatingActionsProps {
  currentConversation: any;
  onNewConversation: () => void;
  onActivateFocusMode: () => void;
}

const ChatFloatingActions = ({
  currentConversation,
  onNewConversation,
  onActivateFocusMode
}: ChatFloatingActionsProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleFloatingAction = (action: string) => {
    switch (action) {
      case 'new-chat':
        onNewConversation();
        break;
      case 'focus-mode':
        onActivateFocusMode();
        toast({
          title: "Focus Mode Ativado",
          description: "Modo de escrita minimalista ativado",
        });
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  };

  if (!isMobile) return null;

  return (
    <FloatingActionButton 
      onAction={handleFloatingAction}
      currentSection="chat"
      hasActiveChat={!!currentConversation}
      hasDocument={false}
      className="fixed bottom-20 right-4 z-40 shadow-xl"
    />
  );
};

export default ChatFloatingActions;

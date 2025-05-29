
import { Sparkles } from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import ChatMessages from './ChatMessages';

interface ChatContentProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  isNavigating?: boolean;
}

const ChatContent = ({ 
  currentConversation, 
  messages,
  processing,
  isNavigating = false
}: ChatContentProps) => {
  if (currentConversation) {
    return (
      <div className="flex-1 min-h-0">
        <ChatMessages 
          messages={messages}
          loading={isNavigating}
          processing={processing}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="empty-state-icon mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-title text-xl mb-3 gradient-text">
          Bem-vindo ao Chat Premium
        </h2>
        <p className="text-caption mb-6">
          Digite sua mensagem abaixo para iniciar uma nova conversa com a IA mais avançada.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="glass-card p-4 text-left">
            <h4 className="text-white font-medium mb-1">💡 Sugestões</h4>
            <p className="text-white/60 text-xs">Peça ideias criativas</p>
          </div>
          <div className="glass-card p-4 text-left">
            <h4 className="text-white font-medium mb-1">📊 Análises</h4>
            <p className="text-white/60 text-xs">Analise dados e textos</p>
          </div>
          <div className="glass-card p-4 text-left">
            <h4 className="text-white font-medium mb-1">🔧 Código</h4>
            <p className="text-white/60 text-xs">Ajuda com programação</p>
          </div>
          <div className="glass-card p-4 text-left">
            <h4 className="text-white font-medium mb-1">✍️ Escrita</h4>
            <p className="text-white/60 text-xs">Crie textos incríveis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContent;

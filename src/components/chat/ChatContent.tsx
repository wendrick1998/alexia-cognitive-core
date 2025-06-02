
import { memo } from 'react';
import { Sparkles } from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import ChatMessages from './ChatMessages';

interface ChatContentProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  isNavigating?: boolean;
  renderMessageExtras?: (message: Message) => React.ReactNode;
}

const ChatContent = memo(({ 
  currentConversation, 
  messages,
  processing,
  isNavigating = false,
  renderMessageExtras
}: ChatContentProps) => {
  if (currentConversation) {
    return (
      <div className="flex-1 h-full relative overflow-hidden">
        <ChatMessages 
          messages={messages}
          loading={isNavigating}
          processing={processing}
          renderMessageExtras={renderMessageExtras}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Bem-vindo ao Chat Premium
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Digite sua mensagem abaixo para iniciar uma nova conversa com a IA mais avançada.
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">💡 Sugestões</h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Peça ideias criativas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">📊 Análises</h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Analise dados e textos</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🔧 Código</h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Ajuda com programação</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">✍️ Escrita</h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs">Crie textos incríveis</p>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatContent.displayName = 'ChatContent';

export default ChatContent;

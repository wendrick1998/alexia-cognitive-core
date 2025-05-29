
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { ArrowLeft, Edit3, Share, MoreHorizontal, Sparkles } from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import ChatMessages from './ChatMessages';
import RevolutionaryInput from './RevolutionaryInput';
import ModelSelector from './ModelSelector';

interface ChatAreaProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  onSendMessage: (message: string) => void;
  onBackToConversations?: () => void;
  isMobile: boolean;
  isNavigating?: boolean;
}

const ChatArea = ({ 
  currentConversation, 
  messages,
  processing,
  onSendMessage,
  onBackToConversations, 
  isMobile,
  isNavigating = false
}: ChatAreaProps) => {
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(currentConversation?.name || 'Nova conversa');

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    console.log('Saving title:', title);
  };

  const handleShare = () => {
    console.log('Sharing conversation');
  };

  const handleMoreActions = () => {
    console.log('More actions');
  };

  console.log('🎨 ChatArea renderizado:', {
    conversation: currentConversation?.id,
    messages: messages.length,
    processing,
    isNavigating
  });

  return (
    <div className="h-full flex flex-col bg-transparent animate-premium-fade-in">
      {/* Header Premium - Always show when there's a conversation */}
      {currentConversation && (
        <div className="glass-card border-b border-white/5 p-4 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && onBackToConversations && (
                <PremiumButton
                  variant="ghost"
                  size="sm"
                  onClick={onBackToConversations}
                  icon={<ArrowLeft className="w-4 h-4" />}
                />
              )}
              
              <div className="flex items-center gap-3">
                {/* AI Avatar Premium */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-premium-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                
                {/* Title Editable */}
                <div className="flex flex-col">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSave();
                        if (e.key === 'Escape') {
                          setIsEditingTitle(false);
                          setTitle(currentConversation?.name || 'Nova conversa');
                        }
                      }}
                      className="input-premium text-lg font-semibold bg-transparent border-none p-0 text-white"
                      autoFocus
                    />
                  ) : (
                    <h1 
                      className="text-lg font-semibold text-white cursor-pointer hover:text-white/80 transition-colors"
                      onClick={handleTitleEdit}
                    >
                      {isNavigating ? 'Carregando...' : (title || 'Nova conversa')}
                    </h1>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span>Conversando com</span>
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={handleTitleEdit}
                icon={<Edit3 className="w-4 h-4" />}
              />
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={handleShare}
                icon={<Share className="w-4 h-4" />}
              />
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={handleMoreActions}
                icon={<MoreHorizontal className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages Area - FIXED: Proper flex layout with min-h-0 to prevent expansion */}
      <div className="flex-1 min-h-0 flex flex-col">
        {currentConversation ? (
          <ChatMessages 
            messages={messages}
            loading={isNavigating}
            processing={processing}
          />
        ) : (
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
        )}
      </div>

      {/* Input Area - FIXED: Always visible at bottom, no scroll interference */}
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
    </div>
  );
};

export default ChatArea;

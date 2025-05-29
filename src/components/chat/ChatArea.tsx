
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { ArrowLeft, Edit3, Share, MoreHorizontal, Sparkles } from 'lucide-react';
import { Conversation } from '@/hooks/useConversations';
import ChatMessages from './ChatMessages';
import RevolutionaryInput from './RevolutionaryInput';
import ModelSelector from './ModelSelector';

interface ChatAreaProps {
  currentConversation: Conversation | null;
  onBackToConversations?: () => void;
  isMobile: boolean;
}

const ChatArea = ({ currentConversation, onBackToConversations, isMobile }: ChatAreaProps) => {
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(currentConversation?.name || 'Nova conversa');

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    // Aqui você implementaria a lógica para salvar o título
    console.log('Saving title:', title);
  };

  const handleShare = () => {
    console.log('Sharing conversation');
  };

  const handleMoreActions = () => {
    console.log('More actions');
  };

  return (
    <div className="h-full flex flex-col bg-transparent animate-premium-fade-in">
      {/* Header Premium */}
      <div className="glass-card border-b border-white/5 p-4 backdrop-blur-xl">
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
                    {title}
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

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {currentConversation ? (
          <ChatMessages 
            conversationId={currentConversation.id}
            className="h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="empty-state-icon mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-title text-xl mb-3 gradient-text">
                Bem-vindo ao Chat Premium
              </h2>
              <p className="text-caption mb-6">
                Selecione uma conversa ou inicie uma nova para começar a conversar com a IA mais avançada.
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

      {/* Input Area */}
      {currentConversation && (
        <div className="glass-card border-t border-white/5 p-4 backdrop-blur-xl">
          <RevolutionaryInput
            conversationId={currentConversation.id}
            onSendMessage={() => {}}
            disabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default ChatArea;

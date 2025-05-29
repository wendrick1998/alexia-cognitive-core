
import { useState } from 'react';
import { PremiumButton } from '@/components/ui/premium-button';
import { ArrowLeft, Edit3, Share, MoreHorizontal, Sparkles } from 'lucide-react';
import { Conversation } from '@/hooks/useConversations';
import ModelSelector from './ModelSelector';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onBackToConversations?: () => void;
  isMobile: boolean;
  isNavigating?: boolean;
}

const ChatHeader = ({ 
  currentConversation, 
  onBackToConversations, 
  isMobile,
  isNavigating = false
}: ChatHeaderProps) => {
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

  if (!currentConversation) return null;

  return (
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
  );
};

export default ChatHeader;

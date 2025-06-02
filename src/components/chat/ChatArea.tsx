
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import { Textarea } from '@/components/ui/textarea';
import ChatMessages from './ChatMessages';
import ChatWelcome from './ChatWelcome';

interface ChatAreaProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  onSendMessage: (message: string) => void;
  onBackToConversations?: () => void;
  isMobile?: boolean;
  isNavigating?: boolean;
  renderMessageExtras?: (message: Message) => React.ReactNode;
}

const ChatArea = ({
  currentConversation,
  messages,
  processing,
  onSendMessage,
  onBackToConversations,
  isMobile = false,
  isNavigating = false,
  renderMessageExtras
}: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!inputValue.trim() || processing) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current && !processing) {
      textareaRef.current.focus();
    }
  }, [processing]);

  return (
    <div className="h-full flex-scroll-layout bg-black">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {isMobile && onBackToConversations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToConversations}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">
              {currentConversation?.name || 'Nova Conversa'}
            </h1>
            <p className="text-sm text-white/60">
              {isNavigating ? 'Carregando...' : `${messages.length} mensagens`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area - CORRIGIDO: Com scroll funcional */}
      <div className="flex-scroll-content scroll-container premium-scrollbar">
        {!currentConversation ? (
          <ChatWelcome />
        ) : (
          <ChatMessages 
            messages={messages} 
            processing={processing}
            renderMessageExtras={renderMessageExtras}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="flex gap-3">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-h-[44px] max-h-32 bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
            disabled={processing}
          />
          <Button
            onClick={handleSubmit}
            disabled={!inputValue.trim() || processing}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[44px] h-[44px]"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

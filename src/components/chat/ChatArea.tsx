
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft,
  MoreHorizontal,
  Share,
  Trash2,
  Download,
  Edit,
  Sparkles,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import { useConversations } from '@/hooks/useConversations';
import MessageCardRevamped from './MessageCardRevamped';
import RevolutionaryInput from './RevolutionaryInput';
import ModelSelector from './ModelSelector';
import { useChatProcessor } from '@/hooks/useChatProcessor';

interface ChatAreaProps {
  currentConversation: Conversation | null;
  onBackToConversations?: () => void;
  isMobile: boolean;
}

const ChatArea = ({ currentConversation, onBackToConversations, isMobile }: ChatAreaProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [showActions, setShowActions] = useState(false);
  
  const { messages, updateConversation } = useConversations();
  const { processing, processMessage } = useChatProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTitleEdit = async () => {
    if (isEditingTitle && currentConversation && editedTitle.trim()) {
      await updateConversation(currentConversation.id, { name: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!currentConversation) return;
    await processMessage(message, currentConversation.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isEditingTitle) {
      handleTitleEdit();
    }
    if (e.key === 'Escape' && isEditingTitle) {
      setIsEditingTitle(false);
      setEditedTitle(currentConversation?.name || '');
    }
  };

  if (!currentConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Bem-vindo ao Alex iA
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Selecione uma conversa para começar ou crie uma nova para explorar as possibilidades da inteligência artificial premium.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <div className="flex items-center space-x-2 text-sm text-white/40 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">⌘N</kbd>
                <span>Nova conversa</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/40 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">⌘F</kbd>
                <span>Focus mode</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-8">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                <MessageCircle className="w-5 h-5 text-blue-400 mb-2" />
                <h3 className="text-white font-medium mb-1">Conversas Inteligentes</h3>
                <p className="text-white/60 text-sm">Interaja com modelos de IA avançados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F]">
      {/* Header Premium Minimalista */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {isMobile && onBackToConversations && (
            <Button
              onClick={onBackToConversations}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10 flex-shrink-0 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Título Editável Premium */}
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyDown={handleKeyDown}
                className="bg-transparent text-white text-lg font-medium w-full outline-none border-b border-blue-400 pb-1 focus:border-blue-300 transition-colors"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setIsEditingTitle(true);
                  setEditedTitle(currentConversation.name || 'Nova Conversa');
                }}
                className="text-lg font-medium text-white hover:text-blue-400 transition-colors text-left truncate w-full group"
              >
                <span className="group-hover:underline decoration-blue-400/50">
                  {currentConversation.name || 'Nova Conversa'}
                </span>
                <Edit className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Model Selector Premium */}
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          {/* Actions Menu Premium */}
          <div className="relative">
            <Button
              onClick={() => setShowActions(!showActions)}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10 rounded-xl"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>

            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/20 rounded-xl shadow-xl z-20 overflow-hidden">
                  <button className="w-full p-3 text-left hover:bg-white/5 text-white transition-colors flex items-center space-x-3">
                    <Share className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                  <button className="w-full p-3 text-left hover:bg-white/5 text-white transition-colors flex items-center space-x-3">
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                  <button className="w-full p-3 text-left hover:bg-white/5 text-red-400 transition-colors flex items-center space-x-3">
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area Premium */}
      <ScrollArea className="flex-1 px-4 py-6" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent'
      }}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <MessageCardRevamped 
              key={message.id} 
              message={message} 
              index={index}
            />
          ))}
          
          {processing && (
            <div className="flex items-start space-x-4 max-w-4xl mx-auto animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-white/70 text-sm font-medium">Alex iA está pensando...</span>
                </div>
                <div className="h-4 bg-white/5 rounded animate-pulse"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area Revolucionária */}
      <RevolutionaryInput
        processing={processing}
        onSendMessage={handleSendMessage}
        contextualPlaceholder="Digite sua mensagem para Alex iA..."
        aiTyping={processing}
      />
    </div>
  );
};

export default ChatArea;

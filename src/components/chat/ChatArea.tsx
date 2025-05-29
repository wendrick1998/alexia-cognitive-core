
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
  ChevronDown
} from 'lucide-react';
import { Conversation, Message } from '@/hooks/useConversations';
import { useConversations } from '@/hooks/useConversations';
import MessageCardRevamped from './MessageCardRevamped';
import RevolutionaryInput from './RevolutionaryInput';
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
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  const { messages, updateConversation } = useConversations();
  const { processing, processMessage } = useChatProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', emoji: '⚡', description: 'Rápido e eficiente' },
    { id: 'gpt-4o', name: 'GPT-4o', emoji: '✨', description: 'Mais poderoso' },
  ];

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
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Bem-vindo ao Alex iA
          </h2>
          <p className="text-white/60 mb-6">
            Selecione uma conversa para começar ou crie uma nova para explorar as possibilidades da inteligência artificial.
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-sm text-white/40">
            <kbd className="px-2 py-1 bg-white/10 rounded">⌘N</kbd>
            <span>Nova conversa</span>
            <kbd className="px-2 py-1 bg-white/10 rounded">⌘F</kbd>
            <span>Focus mode</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {isMobile && onBackToConversations && (
            <Button
              onClick={onBackToConversations}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Title */}
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyDown={handleKeyDown}
                className="bg-transparent text-white text-lg font-medium w-full outline-none border-b border-blue-400 pb-1"
                autoFocus
              />
            ) : (
              <button
                onClick={() => {
                  setIsEditingTitle(true);
                  setEditedTitle(currentConversation.name || 'Nova Conversa');
                }}
                className="text-lg font-medium text-white hover:text-blue-400 transition-colors text-left truncate w-full"
              >
                {currentConversation.name || 'Nova Conversa'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Model Selector */}
          <div className="relative">
            <Button
              onClick={() => setShowModelSelector(!showModelSelector)}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
            >
              <span className="mr-1">
                {models.find(m => m.id === selectedModel)?.emoji}
              </span>
              {models.find(m => m.id === selectedModel)?.name}
              <ChevronDown className="w-3 h-3 ml-2" />
            </Button>

            {showModelSelector && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#1A1A1A] border border-white/20 rounded-xl shadow-xl z-10">
                {models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelSelector(false);
                    }}
                    className={`w-full p-3 text-left hover:bg-white/10 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                      selectedModel === model.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{model.emoji}</span>
                      <div>
                        <div className="text-white font-medium">{model.name}</div>
                        <div className="text-white/60 text-xs">{model.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-white hover:bg-white/10"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <MessageCardRevamped key={message.id} message={message} index={index} />
          ))}
          
          {processing && (
            <div className="flex items-start space-x-4 max-w-4xl mx-auto animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-white/70 text-sm">Alex iA está pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
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

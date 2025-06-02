
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NewChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<boolean>;
  loading?: boolean;
  className?: string;
}

const NewChatInterface = ({
  messages,
  onSendMessage,
  loading = false,
  className
}: NewChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const messageContent = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      await onSendMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const timestamp = formatDistanceToNow(new Date(message.created_at), { 
      addSuffix: true, 
      locale: ptBR 
    });

    return (
      <div className={cn(
        "flex items-start gap-3 max-w-[85%] mb-6",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={cn(
            "text-white text-sm",
            isUser 
              ? "bg-gradient-to-br from-blue-500 to-blue-600" 
              : "bg-gradient-to-br from-gray-700 to-gray-800"
          )}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className={cn(
            "px-4 py-3 rounded-2xl shadow-sm relative",
            "transition-all duration-200 hover:shadow-md",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-bl-md"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          <div className={cn(
            "flex items-center gap-2 px-2 text-xs text-white/40",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span>{timestamp}</span>
            {message.llm_model && !isUser && (
              <>
                <span>•</span>
                <span>{message.llm_model}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col bg-black", className)}>
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Olá! Sou a Yá 👋
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  Sua assistente de IA pessoal. Como posso ajudar você hoje?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {[
                    "Preciso de ajuda com código",
                    "Quero criar um plano de estudos",
                    "Me ajude com ideias criativas",
                    "Explique um conceito complexo"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="p-3 text-left text-sm bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/80 hover:text-white transition-all duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {sending && (
                <div className="flex items-start gap-3 max-w-[85%] mr-auto mb-6">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-white/60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Yá está pensando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-white/10 p-6 bg-black/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                className="min-h-[44px] max-h-[120px] resize-none bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-12"
                disabled={sending}
              />
              
              {inputValue.length > 0 && (
                <div className="absolute bottom-2 right-2 text-xs text-white/40">
                  {inputValue.length}
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-[44px] px-4"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-white/40 text-center">
            A Yá pode cometer erros. Considere verificar informações importantes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatInterface;

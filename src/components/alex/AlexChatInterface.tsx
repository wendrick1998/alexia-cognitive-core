
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { AlexChatMessage } from '@/hooks/useAlexChatSessions';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlexChatInterfaceProps {
  messages: AlexChatMessage[];
  onSendMessage: (content: string) => Promise<boolean>;
  loading?: boolean;
  className?: string;
}

const AlexChatInterface = ({
  messages,
  onSendMessage,
  loading = false,
  className
}: AlexChatInterfaceProps) => {
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

  const MessageBubble = ({ message }: { message: AlexChatMessage }) => {
    const isUser = message.role === 'user';
    const timestamp = formatDistanceToNow(new Date(message.created_at), { 
      addSuffix: true, 
      locale: ptBR 
    });

    return (
      <div className={cn(
        "flex items-start gap-4 max-w-[85%] mb-8",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}>
        <Avatar className="w-10 h-10 flex-shrink-0 shadow-lg">
          <AvatarFallback className={cn(
            "text-white text-sm font-semibold",
            isUser 
              ? "bg-gradient-to-br from-blue-500 to-blue-600" 
              : "bg-gradient-to-br from-purple-600 to-indigo-700"
          )}>
            {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className={cn(
            "px-6 py-4 rounded-2xl shadow-lg relative backdrop-blur-sm",
            "transition-all duration-300 hover:shadow-xl",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-gradient-to-br from-gray-800/80 to-gray-900/80 text-white border border-white/10 rounded-bl-md"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            
            {/* Efeito de brilho sutil */}
            <div className={cn(
              "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none",
              isUser 
                ? "bg-gradient-to-r from-white/10 to-transparent hover:opacity-100" 
                : "bg-gradient-to-r from-purple-500/10 to-transparent hover:opacity-100"
            )} />
          </div>

          <div className={cn(
            "flex items-center gap-2 px-2 text-xs text-white/50",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span>{timestamp}</span>
            {message.llm_model && !isUser && (
              <>
                <span>•</span>
                <span className="text-purple-400">{message.llm_model}</span>
              </>
            )}
            {message.tokens_used && !isUser && (
              <>
                <span>•</span>
                <span className="text-blue-400">{message.tokens_used} tokens</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-b from-black to-gray-900", className)}>
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Olá! Sou a Alex IA ✨
                </h2>
                <p className="text-white/70 mb-10 max-w-md mx-auto leading-relaxed">
                  Sua assistente de inteligência artificial premium. Estou aqui para ajudar com qualquer coisa que precisar.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: "💡", title: "Ideias Criativas", desc: "Brainstorming e soluções inovadoras" },
                    { icon: "📊", title: "Análise de Dados", desc: "Insights profundos e relatórios" },
                    { icon: "🔧", title: "Código & Tech", desc: "Desenvolvimento e programação" },
                    { icon: "✍️", title: "Escrita Premium", desc: "Conteúdo de alta qualidade" }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(`Me ajude com ${suggestion.title.toLowerCase()}`)}
                      className="group p-6 text-left bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/20 rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="text-2xl mb-3">{suggestion.icon}</div>
                      <h3 className="font-semibold text-white mb-2">{suggestion.title}</h3>
                      <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                        {suggestion.desc}
                      </p>
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
                <div className="flex items-start gap-4 max-w-[85%] mr-auto mb-8">
                  <Avatar className="w-10 h-10 flex-shrink-0 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                      <Sparkles className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 rounded-2xl rounded-bl-md px-6 py-4">
                    <div className="flex items-center gap-3 text-white/70">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Alex IA está processando...</span>
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
      <div className="border-t border-white/10 p-6 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem para Alex IA... (Enter para enviar, Shift+Enter para nova linha)"
                className="min-h-[50px] max-h-[120px] resize-none bg-white/5 border-white/20 text-white placeholder:text-white/50 pr-16 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={sending}
              />
              
              {inputValue.length > 0 && (
                <div className="absolute bottom-3 right-4 text-xs text-white/40">
                  {inputValue.length}
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-[50px] px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <div className="mt-3 text-xs text-white/40 text-center">
            Alex IA é uma assistente premium. Verifique informações importantes quando necessário.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlexChatInterface;

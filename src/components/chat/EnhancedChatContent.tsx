
import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation, Message } from '@/hooks/useConversations';
import { IntegratedMemoryResponse } from '@/hooks/useIntegratedMemory';
import ChatMessage from './ChatMessage';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';

interface EnhancedChatContentProps {
  currentConversation: Conversation | null;
  messages: Message[];
  processing: boolean;
  isNavigating?: boolean;
  memoryDataMap?: Map<string, IntegratedMemoryResponse>;
  renderMessageExtras?: (message: Message) => React.ReactNode;
}

const EnhancedChatContent = ({
  currentConversation,
  messages,
  processing,
  isNavigating = false,
  memoryDataMap = new Map(),
  renderMessageExtras
}: EnhancedChatContentProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  }, [messages.length, processing]);

  // Estado vazio - Nova conversa
  if (!currentConversation && !isNavigating) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-6">
          {/* Ícone principal */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          
          {/* Título e descrição */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Bem-vindo ao Alex iA Premium
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Seu agente cognitivo pessoal com busca semântica avançada, 
              memória contextual e capacidades de raciocínio aprimoradas.
            </p>
          </div>

          {/* Card informativo */}
          <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">IA Cognitiva</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Processamento contextual avançado com memória persistente e raciocínio semântico.
            </p>
          </div>

          {/* Call to action */}
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Digite sua primeira mensagem para iniciar uma conversa...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de carregamento
  if (isNavigating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Carregando conversa...</p>
            <p className="text-xs text-muted-foreground">Aguarde um momento</p>
          </div>
        </div>
      </div>
    );
  }

  // Chat com mensagens
  return (
    <div className="h-full flex flex-col">
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 px-4 py-6"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            // Estado: conversa existe mas sem mensagens
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {currentConversation?.name || 'Nova Conversa'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comece digitando sua primeira mensagem abaixo
                </p>
              </div>
            </div>
          ) : (
            // Renderizar mensagens
            messages.map((message, index) => (
              <div key={message.id || index} className="animate-fade-in">
                <ChatMessage
                  message={message}
                  isLast={index === messages.length - 1}
                  memoryData={memoryDataMap.get(message.id || '')}
                />
                {renderMessageExtras && renderMessageExtras(message)}
              </div>
            ))
          )}

          {/* Indicador de digitação */}
          {processing && (
            <div className="animate-fade-in">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted/50 backdrop-blur-sm rounded-2xl px-4 py-3 border border-border/30">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">IA está pensando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Elemento de referência para scroll */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedChatContent;

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useAutoNaming } from '@/hooks/useAutoNaming';
import { Send, Mic, XCircle, Plus, Paperclip, ArrowUp, ArrowDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { 
  useConversations, 
  Message, 
  Conversation 
} from '@/hooks/useConversations';
import MessageCardRevamped from './chat/MessageCardRevamped';
import AppSidebar from './AppSidebar';
import FloatingActionButton from './chat/FloatingActionButton';

interface ChatProps {
  // Add any props here
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateConversationName, isGenerating } = useAutoNaming();
  const { 
    conversations, 
    activeConversationId, 
    addMessageToConversation, 
    createConversation, 
    loadConversation,
    updateConversationName
  } = useConversations();

  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isBottomVisible, setIsBottomVisible] = useState(true);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load conversation on activeConversationId change
  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
      setIsNewConversation(false);
    } else {
      setIsNewConversation(true);
    }
  }, [activeConversationId, loadConversation]);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [conversations, activeConversationId]);

  // Check if bottom is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomVisible(entry.isIntersecting);
      },
      { threshold: 1 }
    );

    if (chatBottomRef.current) {
      observer.observe(chatBottomRef.current);
    }

    return () => {
      if (chatBottomRef.current) {
        observer.unobserve(chatBottomRef.current);
      }
    };
  }, [chatBottomRef]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const startNewConversation = async () => {
    setIsNewConversation(true);
    const newConversationId = uuidv4();
    
    // Create a new conversation with a temporary name
    await createConversation({
      id: newConversationId,
      name: 'Nova Conversa',
      created_by: user?.id || '',
      created_at: new Date().toISOString(),
    });

    // Load the new conversation
    loadConversation(newConversationId);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    setError(null);

    // Get current conversation or create new
    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = uuidv4();

      // Create a new conversation with a temporary name
      await createConversation({
        id: conversationId,
        name: 'Nova Conversa',
        created_by: user?.id || '',
        created_at: new Date().toISOString(),
      });
    }

    // Add user message to conversation
    const userMessage: Message = {
      id: uuidv4(),
      conversation_id: conversationId,
      role: 'user',
      content: inputMessage,
      created_at: new Date().toISOString(),
    };
    await addMessageToConversation(conversationId, userMessage);
    setInputMessage('');

    // Generate AI response
    const aiMessage = await generateAIResponse(conversationId, inputMessage);
    if (aiMessage) {
      await addMessageToConversation(conversationId, aiMessage);
    }

    setIsLoading(false);
  };

  const generateAIResponse = async (conversationId: string, messageContent: string): Promise<Message | null> => {
    const currentAbortController = new AbortController();
    setAbortController(currentAbortController);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversationId, 
          messageContent 
        }),
        signal: currentAbortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar resposta da IA: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.result && data.result.content) {
        // Auto naming
        if (isNewConversation && !isGenerating) {
          const newName = await generateConversationName(data.result.content);
          await updateConversationName(conversationId, newName);
          setIsNewConversation(false);
        }

        const aiMessage: Message = {
          id: uuidv4(),
          conversation_id: conversationId,
          role: 'assistant',
          content: data.result.content,
          llm_used: data.result.llm_used,
          created_at: new Date().toISOString(),
        };
        return aiMessage;
      } else {
        throw new Error('Resposta da IA inválida');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Geração da IA cancelada');
      } else {
        setError(error.message || 'Erro desconhecido ao gerar resposta da IA.');
        toast({
          variant: "destructive",
          title: "Erro ao gerar resposta da IA",
          description: error.message || 'Erro desconhecido ao gerar resposta da IA.',
        });
      }
      return null;
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const cancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      toast({
        title: "Geração da IA cancelada",
        description: "A geração da resposta foi interrompida.",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFloatingAction = (action: string) => {
    switch (action) {
      case 'new-chat':
        startNewConversation();
        break;
      case 'voice-mode':
        setIsVoiceMode(!isVoiceMode);
        toast({
          title: isVoiceMode ? "Modo Voz Desativado" : "Modo Voz Ativado",
          description: isVoiceMode ? "Voltando ao modo texto" : "Agora você pode falar com a AlexIA",
        });
        break;
      case 'screenshot':
        toast({
          title: "Screenshot",
          description: "Funcionalidade em desenvolvimento",
        });
        break;
      case 'change-model':
        toast({
          title: "Mudar Modelo",
          description: "Alternando entre modelos de IA disponíveis",
        });
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeConversationId ? (
            conversations[activeConversationId]?.messages?.map((message, index) => (
              <MessageCardRevamped key={message.id} message={message} index={index} />
            ))
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-6">
              Selecione uma conversa para começar a conversar.
            </div>
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-3 max-w-md mx-auto mb-6 animate-fade-in">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mic className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-64 h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="w-48 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Scroll Anchor */}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 p-4">
          <div className="relative flex items-center space-x-3">
            {/* Cancel Button */}
            {isLoading && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={cancelGeneration}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full hover:bg-red-500/10 dark:hover:bg-red-500/20"
              >
                <XCircle className="w-5 h-5 text-red-500" />
              </Button>
            )}
            
            {/* Input Field */}
            <Input
              type="text"
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 rounded-full py-2.5 pl-12 pr-4 shadow-sm focus-visible:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            />
            
            {/* Send Button */}
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              className="rounded-full shadow-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button - Updated with context */}
      <FloatingActionButton 
        onAction={handleFloatingAction}
        currentSection="chat"
        hasActiveChat={!!activeConversationId}
        hasDocument={false} // You can integrate with document state if needed
      />
    </div>
  );
};

export default Chat;

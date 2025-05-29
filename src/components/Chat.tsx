import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatProcessor } from "@/hooks/useChatProcessor";
import { useCognitiveSystem } from "@/hooks/useCognitiveSystem";
import { useCognitiveOrchestrator } from "@/hooks/useCognitiveOrchestrator";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatHeaderMinimal from "./chat/ChatHeaderMinimal";
import QuickActionsBar from "./chat/QuickActionsBar";
import RevolutionaryInput from "./chat/RevolutionaryInput";
import FloatingActionButton from "./chat/FloatingActionButton";
import MessageCardRevamped from "./chat/MessageCardRevamped";
import ChatWelcome from "./chat/ChatWelcome";
import ConversationSidebar from "./ConversationSidebar";
import { ChatLoadingSkeleton } from "./chat/ChatSkeleton";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const Chat = () => {
  const [currentModel, setCurrentModel] = useState('auto');
  const [aiTyping, setAiTyping] = useState(false);
  const [showConversationSidebar, setShowConversationSidebar] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    currentConversation, 
    messages, 
    loading, 
    conversationState,
    createAndNavigateToNewConversation,
    loadMessages,
    updateConversationTimestamp,
  } = useConversations();
  
  const { processing, processMessage } = useChatProcessor();
  const { createCognitiveNode, cognitiveState } = useCognitiveSystem();
  const { orchestrateCognitiveProcess } = useCognitiveOrchestrator();
  const { toast } = useToast();

  // Auto-show conversation sidebar on desktop
  useEffect(() => {
    if (!isMobile) {
      setShowConversationSidebar(true);
    }
  }, [isMobile]);

  const handleSendMessage = async (messageText: string) => {
    let conversation = currentConversation;
    
    if (!conversation) {
      console.log('🔥 Nenhuma conversa ativa, criando nova...');
      conversation = await createAndNavigateToNewConversation();
      if (!conversation) {
        console.error('❌ Falha ao criar conversa para enviar mensagem');
        return;
      }
    }

    console.log(`📤 Enviando mensagem para conversa: ${conversation.id}`);
    
    setAiTyping(true);
    
    await createCognitiveNode(
      messageText, 
      'question', 
      { source: 'user_message', urgency: 'medium' },
      conversation.id
    );

    const cognitiveCommands = ['@deep-think', '@connect', '@evolve', '@simulate'];
    const hasCommand = cognitiveCommands.some(cmd => messageText.includes(cmd));
    
    let response;
    if (hasCommand || cognitiveState.currentMode.type !== 'focus') {
      console.log('🧠 Usando processamento cognitivo avançado...');
      const cognitiveResult = await orchestrateCognitiveProcess(messageText, {
        conversationId: conversation.id,
        currentMode: cognitiveState.currentMode.type
      });
      
      response = await processMessage(messageText, conversation.id);
      
      if (cognitiveResult.success) {
        await createCognitiveNode(
          JSON.stringify(cognitiveResult.result),
          'insight',
          { 
            source: 'cognitive_orchestration',
            insights: cognitiveResult.insights,
            connections: cognitiveResult.connectionsFound,
            processingTime: cognitiveResult.processingTime
          },
          conversation.id
        );
      }
    } else {
      response = await processMessage(messageText, conversation.id);
    }
    
    setAiTyping(false);
    
    if (response) {
      await createCognitiveNode(
        response.content || 'Resposta do AI',
        'answer',
        { source: 'ai_response', model: response.model },
        conversation.id
      );
      
      await updateConversationTimestamp(conversation.id);
      await loadMessages(conversation.id);
    }
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    toast({
      title: "Ação rápida",
      description: `Ação ${action} será implementada em breve!`,
    });
  };

  const handleFABAction = (action: string) => {
    switch (action) {
      case 'new-chat':
        createAndNavigateToNewConversation();
        break;
      case 'change-model':
        break;
      default:
        toast({
          title: "Ação",
          description: `${action} será implementada em breve!`,
        });
    }
  };

  const handleProfileClick = () => {
    toast({
      title: "Perfil",
      description: "Menu de perfil será implementado em breve!",
    });
  };

  const getContextualPlaceholder = () => {
    if (processing) return "Processando...";
    if (conversationState.isCreatingNew) return "Criando nova conversa...";
    if (!currentConversation) return "Comece uma nova conversa...";
    if (messages.length === 0) return "Digite sua primeira mensagem...";
    return "Continue a conversa...";
  };

  const isLoadingState = loading || conversationState.isNavigating || conversationState.isLoadingMessages;

  return (
    <div className="flex-1 flex bg-slate-50/50 min-h-screen">
      {/* Conversation Sidebar */}
      {(!isMobile || showConversationSidebar) && (
        <ConversationSidebar
          isOpen={showConversationSidebar}
          onToggle={() => setShowConversationSidebar(!showConversationSidebar)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/50">
          <ChatHeaderMinimal
            currentModel={currentModel}
            onModelChange={setCurrentModel}
            onProfileClick={handleProfileClick}
          />
          
          {/* Mobile Conversation Toggle */}
          {isMobile && (
            <div className="px-4 pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConversationSidebar(true)}
                className="w-full justify-start glass-effect"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {currentConversation?.name || 'Selecionar conversa'}
              </Button>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto premium-scrollbar bg-gradient-to-b from-slate-50/50 to-white/50">
          <div className="px-4 py-6">
            {isLoadingState ? (
              <ChatLoadingSkeleton />
            ) : messages.length === 0 ? (
              <ChatWelcome />
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <div key={message.id} className="premium-fade-in">
                    <MessageCardRevamped message={message} index={index} />
                  </div>
                ))}
                
                {processing && (
                  <div className="flex items-start space-x-4 max-w-4xl mx-auto mb-4 premium-scale-in">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-premium">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div className="max-w-2xl p-6 rounded-3xl glass-effect text-slate-800 shadow-premium">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-base text-slate-700 font-medium">
                          Analisando e processando sua mensagem...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <QuickActionsBar onAction={handleQuickAction} />

        {/* Revolutionary Input */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/50">
          <RevolutionaryInput
            processing={processing || conversationState.isCreatingNew}
            onSendMessage={handleSendMessage}
            contextualPlaceholder={getContextualPlaceholder()}
            aiTyping={aiTyping}
          />
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onAction={handleFABAction} />
      </div>
    </div>
  );
};

export default Chat;

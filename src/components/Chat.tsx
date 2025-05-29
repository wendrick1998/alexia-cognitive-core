
import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatProcessor } from "@/hooks/useChatProcessor";
import { useCognitiveSystem } from "@/hooks/useCognitiveSystem";
import { useCognitiveOrchestrator } from "@/hooks/useCognitiveOrchestrator";
import { useToast } from "@/hooks/use-toast";
import ChatHeaderMinimal from "./chat/ChatHeaderMinimal";
import QuickActionsBar from "./chat/QuickActionsBar";
import RevolutionaryInput from "./chat/RevolutionaryInput";
import FloatingActionButton from "./chat/FloatingActionButton";
import MessageCardRevamped from "./chat/MessageCardRevamped";
import ChatWelcome from "./chat/ChatWelcome";
import { ChatLoadingSkeleton } from "./chat/ChatSkeleton";

const Chat = () => {
  const [currentModel, setCurrentModel] = useState('auto');
  const [aiTyping, setAiTyping] = useState(false);
  
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

  const handleSendMessage = async (messageText: string) => {
    let conversation = currentConversation;
    
    // Se não há conversa atual, criar uma nova automaticamente
    if (!conversation) {
      console.log('🔥 Nenhuma conversa ativa, criando nova...');
      conversation = await createAndNavigateToNewConversation();
      if (!conversation) {
        console.error('❌ Falha ao criar conversa para enviar mensagem');
        return;
      }
    }

    console.log(`📤 Enviando mensagem para conversa: ${conversation.id}`);
    
    // Set AI typing
    setAiTyping(true);
    
    // 🧠 Create cognitive node for user message
    await createCognitiveNode(
      messageText, 
      'question', 
      { source: 'user_message', urgency: 'medium' },
      conversation.id
    );

    // Check for cognitive commands
    const cognitiveCommands = ['@deep-think', '@connect', '@evolve', '@simulate'];
    const hasCommand = cognitiveCommands.some(cmd => messageText.includes(cmd));
    
    let response;
    if (hasCommand || cognitiveState.currentMode.type !== 'focus') {
      // Use cognitive orchestration for enhanced processing
      console.log('🧠 Usando processamento cognitivo avançado...');
      const cognitiveResult = await orchestrateCognitiveProcess(messageText, {
        conversationId: conversation.id,
        currentMode: cognitiveState.currentMode.type
      });
      
      // Still process through normal chat for UI consistency
      response = await processMessage(messageText, conversation.id);
      
      // Create cognitive node for enhanced result
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
      // Normal message processing
      response = await processMessage(messageText, conversation.id);
    }
    
    setAiTyping(false);
    
    if (response) {
      // Create cognitive node for AI response
      await createCognitiveNode(
        response.content || 'Resposta do AI',
        'answer',
        { source: 'ai_response', model: response.model },
        conversation.id
      );
      
      await updateConversationTimestamp(conversation.id);
      // Recarregar mensagens para mostrar a nova interação
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
        // This will be handled by the header
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

  // Estados de carregamento otimizados
  const isLoadingState = loading || conversationState.isNavigating || conversationState.isLoadingMessages;

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] min-h-screen">
      <ChatHeaderMinimal
        currentModel={currentModel}
        onModelChange={setCurrentModel}
        onProfileClick={handleProfileClick}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isLoadingState ? (
          <ChatLoadingSkeleton />
        ) : messages.length === 0 ? (
          <ChatWelcome />
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageCardRevamped key={message.id} message={message} index={index} />
            ))}
            
            {processing && (
              <div className="flex items-start space-x-4 max-w-4xl mx-auto mb-4 animate-fade-in">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#F59E0B] rounded-full border-2 border-[#0A0A0A] animate-pulse" />
                </div>
                <div className="max-w-2xl p-4 rounded-3xl bg-[#1A1A1A] border border-white/10 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-base text-white/90">
                      Analisando e processando sua mensagem...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <QuickActionsBar onAction={handleQuickAction} />

      {/* Revolutionary Input */}
      <RevolutionaryInput
        processing={processing || conversationState.isCreatingNew}
        onSendMessage={handleSendMessage}
        contextualPlaceholder={getContextualPlaceholder()}
        aiTyping={aiTyping}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onAction={handleFABAction} />
    </div>
  );
};

export default Chat;

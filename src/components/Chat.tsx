
import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatProcessor } from "@/hooks/useChatProcessor";
import { useCognitiveSystem } from "@/hooks/useCognitiveSystem";
import { useCognitiveOrchestrator } from "@/hooks/useCognitiveOrchestrator";
import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./chat/ChatHeader";
import ChatMessages from "./chat/ChatMessages";
import ChatInput from "./chat/ChatInput";
import CognitiveInterface from "./cognitive/CognitiveInterface";
import { ChatLoadingSkeleton } from "./chat/ChatSkeleton";

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCognitiveInterface, setShowCognitiveInterface] = useState(false);
  
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

  // ✅ FUNÇÃO PRINCIPAL - Nova Conversa Premium
  const handleNewConversation = async () => {
    console.log('🆕 NOVA CONVERSA SOLICITADA - UX PREMIUM');
    const newConversation = await createAndNavigateToNewConversation();
    
    if (newConversation) {
      console.log('🎯 Nova conversa criada e ativa, pronta para primeira mensagem!');
      
      // Create cognitive node for new conversation
      await createCognitiveNode(
        `Nova conversa iniciada: ${newConversation.name || 'Sem nome'}`,
        'conversation',
        { source: 'new_conversation', conversation_id: newConversation.id },
        newConversation.id
      );
    }
  };

  // Estados de carregamento otimizados
  const isLoadingState = loading || conversationState.isNavigating || conversationState.isLoadingMessages;
  const isCreatingNew = conversationState.isCreatingNew;

  return (
    <div className="flex-1 flex bg-gradient-to-br from-slate-50 via-white to-blue-50/30 min-h-screen">
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col relative">
        <ChatHeader
          currentConversation={currentConversation}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewConversation={handleNewConversation}
          isCreatingNew={isCreatingNew}
          isNavigating={conversationState.isNavigating}
        />

        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {isLoadingState ? (
              <ChatLoadingSkeleton />
            ) : (
              <ChatMessages
                messages={messages}
                loading={false}
                processing={processing}
              />
            )}

            <ChatInput
              processing={processing || isCreatingNew}
              currentConversation={currentConversation}
              onSendMessage={handleSendMessage}
              placeholder={
                isCreatingNew 
                  ? "Criando nova conversa..." 
                  : currentConversation 
                    ? "Digite sua mensagem... (Use @deep-think, @connect, @evolve, @simulate para comandos especiais)"
                    : "Comece uma nova conversa..."
              }
            />
          </div>

          {/* Cognitive Interface - Right Panel */}
          {showCognitiveInterface && (
            <div className="w-80 border-l border-gray-200 overflow-y-auto">
              <CognitiveInterface />
            </div>
          )}
        </div>

        {/* Cognitive Interface Toggle */}
        <button
          onClick={() => setShowCognitiveInterface(!showCognitiveInterface)}
          className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
        >
          🧠
        </button>
      </div>
    </div>
  );
};

export default Chat;


/**
 * @modified_by Manus AI - FASE 2: Diagnóstico Detalhado do Chat
 * @date 3 de junho de 2025
 * @description Chat com logs detalhados para identificar ponto de quebra
 */

// LOG CRÍTICO: Verificar se o arquivo Chat.tsx está sendo carregado
console.log('💬 CHAT.TSX CARREGANDO - início da importação');

try {
  console.log('💬 Importando React hooks...');
  import { useState, useEffect, useRef } from 'react';
  console.log('✅ React hooks importados');
} catch (error) {
  console.error('❌ ERRO ao importar React hooks:', error);
}

let useAuth, useToast, useConversations, useChatProcessor, useFocusMode, useCognitiveMemoryIntegration;
let PremiumChatLayout, FocusMode, FloatingActionButton, useIsMobile, ResponseSource;

try {
  console.log('💬 Importando hooks personalizados...');
  ({ useAuth } = require('@/hooks/useAuth'));
  console.log('✅ useAuth importado');
  
  ({ useToast } = require("@/hooks/use-toast"));
  console.log('✅ useToast importado');
  
  ({ useConversations } = require('@/hooks/useConversations'));
  console.log('✅ useConversations importado');
  
  ({ useChatProcessor } = require('@/hooks/useChatProcessor'));
  console.log('✅ useChatProcessor importado');
  
  ({ useFocusMode } = require('@/hooks/useFocusMode'));
  console.log('✅ useFocusMode importado');
  
  ({ useCognitiveMemoryIntegration } = require('@/hooks/useCognitiveMemoryIntegration'));
  console.log('✅ useCognitiveMemoryIntegration importado');
  
} catch (error) {
  console.error('❌ ERRO ao importar hooks personalizados:', error);
}

try {
  console.log('💬 Importando componentes...');
  PremiumChatLayout = require('./chat/PremiumChatLayout').default;
  console.log('✅ PremiumChatLayout importado');
  
  FocusMode = require('./focus/FocusMode').default;
  console.log('✅ FocusMode importado');
  
  FloatingActionButton = require('./chat/FloatingActionButton').default;
  console.log('✅ FloatingActionButton importado');
  
  ({ useIsMobile } = require('@/hooks/use-mobile'));
  console.log('✅ useIsMobile importado');
  
  ResponseSource = require('./ResponseSource').default;
  console.log('✅ ResponseSource importado');
  
} catch (error) {
  console.error('❌ ERRO ao importar componentes:', error);
}

const Chat = () => {
  // LOG CRÍTICO: Verificar se o componente Chat está iniciando
  console.log('💬 CHAT COMPONENT INICIANDO - FASE 2 CONFIRMADA!');

  try {
    console.log('💬 Inicializando hooks básicos...');
    
    let user, toast, isMobile, messagesEndRef;
    
    if (useAuth) {
      console.log('💬 Chamando useAuth...');
      ({ user } = useAuth());
      console.log('✅ useAuth executado, user:', !!user);
    }
    
    if (useToast) {
      console.log('💬 Chamando useToast...');
      ({ toast } = useToast());
      console.log('✅ useToast executado');
    }
    
    if (useIsMobile) {
      console.log('💬 Chamando useIsMobile...');
      isMobile = useIsMobile();
      console.log('✅ useIsMobile executado:', isMobile);
    }
    
    console.log('💬 Criando messagesEndRef...');
    messagesEndRef = useRef(null);
    console.log('✅ messagesEndRef criado');

    console.log('💬 Inicializando hooks complexos...');
    
    let conversations, currentConversation, messages, createAndNavigateToNewConversation;
    let navigateToConversation, conversationState, setMessages, updateConversationTimestamp;
    
    if (useConversations) {
      console.log('💬 Chamando useConversations...');
      ({
        conversations,
        currentConversation,
        messages,
        createAndNavigateToNewConversation,
        navigateToConversation,
        conversationState,
        setMessages,
        updateConversationTimestamp
      } = useConversations());
      console.log('✅ useConversations executado:', {
        conversations: conversations?.length,
        currentConversation: !!currentConversation,
        messages: messages?.length
      });
    }

    let processing, processMessage;
    if (useChatProcessor) {
      console.log('💬 Chamando useChatProcessor...');
      ({ processing, processMessage } = useChatProcessor());
      console.log('✅ useChatProcessor executado, processing:', processing);
    }

    let isActive, activateFocusMode, deactivateFocusMode;
    if (useFocusMode) {
      console.log('💬 Chamando useFocusMode...');
      ({ isActive, activateFocusMode, deactivateFocusMode } = useFocusMode());
      console.log('✅ useFocusMode executado, isActive:', isActive);
    }
    
    let cognitiveMemory;
    if (useCognitiveMemoryIntegration) {
      console.log('💬 Chamando useCognitiveMemoryIntegration...');
      cognitiveMemory = useCognitiveMemoryIntegration();
      console.log('✅ useCognitiveMemoryIntegration executado');
    }

    console.log('💬 Todos os hooks inicializados com sucesso!');

    // Estado local mínimo para teste
    const [cognitiveDataMap, setCognitiveDataMap] = useState(new Map());
    console.log('✅ Estado local inicializado');

    // Funções básicas para teste
    const scrollToBottom = (behavior = 'smooth') => {
      console.log('💬 scrollToBottom chamado');
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
      }
    };

    const handleNewConversation = async () => {
      console.log('💬 handleNewConversation chamado');
      return null; // Simplificado para teste
    };

    const handleConversationSelect = async (conversation) => {
      console.log('💬 handleConversationSelect chamado:', conversation?.id);
    };

    const handleSendMessage = async (message) => {
      console.log('💬 handleSendMessage chamado:', message?.substring(0, 50));
    };

    const handleFloatingAction = (action) => {
      console.log('💬 handleFloatingAction chamado:', action);
    };

    const renderMessageWithSource = (message) => {
      console.log('💬 renderMessageWithSource chamado para:', message?.id);
      return null; // Simplificado para teste
    };

    console.log('💬 Preparando para renderizar JSX...');

    // JSX simplificado para teste
    return (
      <div className="h-full relative">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            💬 CHAT RENDERIZADO COM SUCESSO!
          </h1>
          <p className="text-gray-300">
            FASE 2: Diagnóstico do Chat concluído - componente funcionando
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Conversations: {conversations?.length || 0}</p>
            <p>Messages: {messages?.length || 0}</p>
            <p>Processing: {processing ? 'true' : 'false'}</p>
            <p>Mobile: {isMobile ? 'true' : 'false'}</p>
          </div>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );

  } catch (error) {
    console.error('❌ ERRO CRÍTICO no Chat component:', error);
    
    // Fallback de emergência
    return (
      <div className="h-full flex items-center justify-center bg-red-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">❌ ERRO NO CHAT</h1>
          <p>Erro capturado: {error.message}</p>
          <p className="text-sm mt-2">Verifique o console para detalhes</p>
        </div>
      </div>
    );
  }
};

console.log('💬 Chat component definido - preparando export');

export default Chat;

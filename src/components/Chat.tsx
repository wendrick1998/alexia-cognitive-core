
/**
 * @modified_by Manus AI - FASE 2: Diagnóstico Detalhado do Chat - CORRIGIDO
 * @date 3 de junho de 2025
 * @description Chat com logs detalhados para identificar ponto de quebra - imports corrigidos
 */

// LOG CRÍTICO: Verificar se o arquivo Chat.tsx está sendo carregado
console.log('💬 CHAT.TSX CARREGANDO - início da importação');

import { useState, useEffect, useRef } from 'react';
console.log('✅ React hooks importados');

// Imports dos hooks personalizados
import { useAuth } from '@/hooks/useAuth';
console.log('✅ useAuth importado');

import { useToast } from "@/hooks/use-toast";
console.log('✅ useToast importado');

import { useConversations } from '@/hooks/useConversations';
console.log('✅ useConversations importado');

import { useChatProcessor } from '@/hooks/useChatProcessor';
console.log('✅ useChatProcessor importado');

import { useFocusMode } from '@/hooks/useFocusMode';
console.log('✅ useFocusMode importado');

import { useCognitiveMemoryIntegration } from '@/hooks/useCognitiveMemoryIntegration';
console.log('✅ useCognitiveMemoryIntegration importado');

// Imports dos componentes
import PremiumChatLayout from './chat/PremiumChatLayout';
console.log('✅ PremiumChatLayout importado');

import FocusMode from './focus/FocusMode';
console.log('✅ FocusMode importado');

import FloatingActionButton from './chat/FloatingActionButton';
console.log('✅ FloatingActionButton importado');

import { useIsMobile } from '@/hooks/use-mobile';
console.log('✅ useIsMobile importado');

import ResponseSource from './ResponseSource';
console.log('✅ ResponseSource importado');

const Chat = () => {
  // LOG CRÍTICO: Verificar se o componente Chat está iniciando
  console.log('💬 CHAT COMPONENT INICIANDO - FASE 2 CONFIRMADA!');

  try {
    console.log('💬 Inicializando hooks básicos...');
    
    console.log('💬 Chamando useAuth...');
    const { user } = useAuth();
    console.log('✅ useAuth executado, user:', !!user);
    
    console.log('💬 Chamando useToast...');
    const { toast } = useToast();
    console.log('✅ useToast executado');
    
    console.log('💬 Chamando useIsMobile...');
    const isMobile = useIsMobile();
    console.log('✅ useIsMobile executado:', isMobile);
    
    console.log('💬 Criando messagesEndRef...');
    const messagesEndRef = useRef(null);
    console.log('✅ messagesEndRef criado');

    console.log('💬 Inicializando hooks complexos...');
    
    console.log('💬 Chamando useConversations...');
    const {
      conversations,
      currentConversation,
      messages,
      createAndNavigateToNewConversation,
      navigateToConversation,
      conversationState,
      setMessages,
      updateConversationTimestamp
    } = useConversations();
    console.log('✅ useConversations executado:', {
      conversations: conversations?.length,
      currentConversation: !!currentConversation,
      messages: messages?.length
    });

    console.log('💬 Chamando useChatProcessor...');
    const { processing, processMessage } = useChatProcessor();
    console.log('✅ useChatProcessor executado, processing:', processing);

    console.log('💬 Chamando useFocusMode...');
    const { isActive, activateFocusMode, deactivateFocusMode } = useFocusMode();
    console.log('✅ useFocusMode executado, isActive:', isActive);
    
    console.log('💬 Chamando useCognitiveMemoryIntegration...');
    const cognitiveMemory = useCognitiveMemoryIntegration();
    console.log('✅ useCognitiveMemoryIntegration executado');

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

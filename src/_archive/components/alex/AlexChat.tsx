
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
// import { useAlexChatSessions } from '@/hooks/useAlexChatSessions'; // Hook não existe mais
import { useIsMobile } from '@/hooks/use-mobile';
// import AlexSessionsList from './AlexSessionsList'; // Componente não foi arquivado
// import AlexChatInterface from './AlexChatInterface'; // Já está arquivado
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import PageTransition from '@/components/ui/PageTransition';
import { showNotification } from '@/components/ui/NotificationToast';
import { motion } from 'framer-motion';

const AlexChat = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Mock data since the hook doesn't exist anymore
  const sessions = [];
  const currentSession = null;
  const messages = [];
  const loading = false;
  const messagesLoading = false;

  const createSession = async () => null;
  const selectSession = async (session: any) => {};
  const sendMessage = async (content: string): Promise<boolean> => false;
  const renameSession = async (id: string, title: string) => {};
  const deleteSession = async (id: string) => {};
  const toggleFavorite = async (id: string) => {};
  const togglePin = async (id: string) => {};
  const resetAllSessions = async () => {};

  const handleNewSession = async () => {
    const newSession = await createSession();
    if (newSession) {
      await selectSession(newSession);
      showNotification({
        title: "Nova conversa criada",
        description: "Pronto para conversar com Alex IA!",
        type: "success",
      });
    }
  };

  const handleSessionSelect = async (session: any) => {
    await selectSession(session);
  };

  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!currentSession) {
      const newSession = await createSession();
      if (!newSession) {
        showNotification({
          title: "Erro",
          description: "Não foi possível criar uma nova conversa",
          type: "error",
        });
        return false;
      }
      await selectSession(newSession);
    }

    return await sendMessage(content);
  };

  const handleResetAll = async () => {
    await resetAllSessions();
    showNotification({
      title: "Reset completo",
      description: "Todas as conversas foram removidas",
      type: "success",
    });
  };

  // Mock sidebar content since AlexSessionsList doesn't exist
  const sidebarContent = (
    <div className="p-4">
      <h3 className="text-white">Alex Sessions (Archived)</h3>
      <p className="text-white/60 text-sm">Component archived - functionality moved to main chat</p>
    </div>
  );

  const headerContent = isMobile ? (
    <motion.div 
      className="px-4 py-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-lg font-semibold text-white">
        {currentSession?.title || 'Alex IA - Assistente Premium (Archived)'}
      </h1>
    </motion.div>
  ) : null;

  // Mock chat interface since AlexChatInterface is archived
  const chatInterface = (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Alex Chat (Archived)</h2>
        <p className="text-white/60">Este componente foi arquivado e sua funcionalidade foi movida para o chat principal.</p>
      </div>
    </div>
  );

  return (
    <PageTransition className="h-full w-full">
      <ResponsiveLayout
        sidebar={sidebarContent}
        header={headerContent}
        className="bg-gradient-to-b from-black to-gray-900"
        sidebarWidth="320px"
      >
        {chatInterface}
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default AlexChat;


import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAlexChatSessions } from '@/hooks/useAlexChatSessions';
import { useIsMobile } from '@/hooks/use-mobile';
import AlexSessionsList from './AlexSessionsList';
import AlexChatInterface from './AlexChatInterface';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import PageTransition from '@/components/ui/PageTransition';
import { showNotification } from '@/components/ui/NotificationToast';
import { motion } from 'framer-motion';

const AlexChat = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const {
    sessions,
    currentSession,
    messages,
    loading,
    messagesLoading,
    createSession,
    selectSession,
    sendMessage,
    renameSession,
    deleteSession,
    toggleFavorite,
    togglePin,
    resetAllSessions,
  } = useAlexChatSessions();

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
      // Se não há sessão atual, criar uma nova automaticamente
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

  const sidebarContent = (
    <AlexSessionsList
      sessions={sessions}
      currentSession={currentSession}
      onSessionSelect={handleSessionSelect}
      onNewSession={handleNewSession}
      onRenameSession={renameSession}
      onDeleteSession={deleteSession}
      onToggleFavorite={toggleFavorite}
      onTogglePin={togglePin}
      onResetAll={handleResetAll}
      loading={loading}
    />
  );

  const headerContent = isMobile ? (
    <motion.div 
      className="px-4 py-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-lg font-semibold text-white">
        {currentSession?.title || 'Alex IA - Assistente Premium'}
      </h1>
    </motion.div>
  ) : null;

  return (
    <PageTransition className="h-full w-full">
      <ResponsiveLayout
        sidebar={sidebarContent}
        header={headerContent}
        className="bg-gradient-to-b from-black to-gray-900"
        sidebarWidth="320px"
      >
        <AlexChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={messagesLoading}
          className="h-full"
        />
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default AlexChat;

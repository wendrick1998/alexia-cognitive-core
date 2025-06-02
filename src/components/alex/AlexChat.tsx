
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useAlexChatSessions } from '@/hooks/useAlexChatSessions';
import { useIsMobile } from '@/hooks/use-mobile';
import AlexSessionsList from './AlexSessionsList';
import AlexChatInterface from './AlexChatInterface';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const AlexChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleNewSession = async () => {
    const newSession = await createSession();
    if (newSession) {
      await selectSession(newSession);
      if (isMobile) {
        setSidebarOpen(false);
      }
      toast({
        title: "Nova conversa criada",
        description: "Pronto para conversar com Alex IA!",
      });
    }
  };

  const handleSessionSelect = async (session: any) => {
    await selectSession(session);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!currentSession) {
      // Se não há sessão atual, criar uma nova automaticamente
      const newSession = await createSession();
      if (!newSession) {
        toast({
          title: "Erro",
          description: "Não foi possível criar uma nova conversa",
          variant: "destructive",
        });
        return false;
      }
      await selectSession(newSession);
    }

    return await sendMessage(content);
  };

  const handleResetAll = async () => {
    await resetAllSessions();
    setSidebarOpen(true); // Mostrar sidebar após reset
  };

  return (
    <div className="h-full w-full flex bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-semibold text-white">
              {currentSession?.title || 'Alex IA - Assistente Premium'}
            </h1>
            <div className="w-10" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out
        w-80 border-r border-white/10
        ${isMobile ? 'pt-16' : ''}
      `}>
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
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className={`
        flex-1 min-w-0
        ${isMobile ? 'pt-16' : ''}
      `}>
        <AlexChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={messagesLoading}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default AlexChat;

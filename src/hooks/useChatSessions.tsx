
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  auto_title: boolean;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  is_favorite: boolean;
  message_count: number;
  last_message_preview?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  tokens_used?: number;
  llm_model?: string;
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar todas as sessões do usuário
  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use Edge Function to get sessions since the table doesn't exist in Supabase types yet
      const { data, error } = await supabase.functions.invoke('get-user-chat-sessions', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Erro ao carregar sessões:', error);
        setSessions([]);
      } else {
        setSessions(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas",
        variant: "destructive",
      });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Carregar mensagens de uma sessão específica
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setMessagesLoading(true);
      
      // Query the chat_messages table directly with proper typing
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/chat_messages?session_id=eq.${sessionId}&order=created_at.asc`, {
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);

  // Criar nova sessão
  const createSession = useCallback(async (): Promise<ChatSession | null> => {
    if (!user) return null;

    try {
      // Use direct HTTP call to create session
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/chat_sessions`, {
        method: 'POST',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: user.id,
          title: 'Novo Chat',
          auto_title: true,
        })
      });

      if (!response.ok) throw new Error('Failed to create session');

      const data = await response.json();
      const newSession = data[0] as ChatSession;
      
      setSessions(prev => [newSession, ...prev]);
      
      return newSession;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar nova conversa",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Selecionar sessão atual
  const selectSession = useCallback(async (session: ChatSession) => {
    setCurrentSession(session);
    await loadMessages(session.id);
  }, [loadMessages]);

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!currentSession || !user) return false;

    try {
      // Adicionar mensagem do usuário temporariamente
      const tempUserMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        session_id: currentSession.id,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, tempUserMessage]);

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke('process-chat-message-yaa', {
        body: {
          session_id: currentSession.id,
          user_message: content,
          user_id: user.id,
        }
      });

      if (error) throw error;

      // Remover mensagem temporária e recarregar mensagens atualizadas
      await loadMessages(currentSession.id);

      // Atualizar lista de sessões para refletir mudanças
      await loadSessions();

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Remover mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
      return false;
    }
  }, [currentSession, user, toast, loadMessages, loadSessions]);

  // Renomear sessão
  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: newTitle, 
          auto_title: false,
          updated_at: new Date().toISOString() 
        })
      });

      if (!response.ok) throw new Error('Failed to rename session');

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle, auto_title: false } : s
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle, auto_title: false } : null);
      }

      toast({
        title: "Sucesso",
        description: "Conversa renomeada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao renomear sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renomear a conversa",
        variant: "destructive",
      });
    }
  }, [currentSession, toast]);

  // Excluir sessão
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete session');

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }

      toast({
        title: "Sucesso",
        description: "Conversa excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa",
        variant: "destructive",
      });
    }
  }, [currentSession, toast]);

  // Favoritar/desfavoritar sessão
  const toggleFavorite = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const response = await fetch(`${supabase.supabaseUrl}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          is_favorite: !session.is_favorite,
          updated_at: new Date().toISOString() 
        })
      });

      if (!response.ok) throw new Error('Failed to toggle favorite');

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, is_favorite: !s.is_favorite } : s
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, is_favorite: !session.is_favorite } : null);
      }
    } catch (error) {
      console.error('Erro ao favoritar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível favoritar a conversa",
        variant: "destructive",
      });
    }
  }, [sessions, currentSession, toast]);

  // Carregar sessões quando usuário mudar
  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [user, loadSessions]);

  return {
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
    loadSessions,
  };
}

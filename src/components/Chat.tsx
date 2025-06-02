
import { useState, useRef, useEffect } from 'react';
import { useAlexChatSessions } from '@/hooks/useAlexChatSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Plus, 
  MessageCircle, 
  Bot, 
  User, 
  Star, 
  Pin,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
    resetAllSessions
  } = useAlexChatSessions();

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateSession = async () => {
    const session = await createSession();
    if (session) {
      selectSession(session);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentSession || !user) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsTyping(true);

    try {
      // Enviar mensagem do usuário
      const success = await sendMessage(userMessage);
      if (!success) {
        throw new Error('Falha ao enviar mensagem');
      }

      // Chamar Edge Function para processar com Alex IA
      const { data, error } = await supabase.functions.invoke('process-chat-message-alex', {
        body: {
          session_id: currentSession.id,
          user_message: userMessage,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        throw error;
      }

      console.log('Resposta da Alex IA:', data);

      toast({
        title: "Mensagem Enviada",
        description: "Alex IA processou sua mensagem com sucesso",
      });

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleEditSession = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = async (sessionId: string) => {
    if (editingTitle.trim()) {
      await renameSession(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  return (
    <div className="h-full flex bg-gradient-to-b from-black to-gray-900">
      {/* Sidebar com Sessões */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Conversas</h2>
            <Button 
              onClick={handleCreateSession}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllSessions}
              className="flex-1 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                    currentSession?.id === session.id
                      ? 'bg-blue-500/20 border-blue-500/30 text-white'
                      : 'bg-gray-900/50 border-white/10 text-white/80 hover:bg-white/5'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {session.pinned && <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                      {session.is_favorite && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                      
                      {editingSessionId === session.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(session.id)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle(session.id)}
                          className="h-6 text-sm bg-transparent border-white/20"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-sm truncate">{session.title}</span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700">
                        <DropdownMenuItem onClick={() => handleEditSession(session.id, session.title)}>
                          <Edit2 className="w-3 h-3 mr-2" />
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFavorite(session.id)}>
                          <Star className="w-3 h-3 mr-2" />
                          {session.is_favorite ? 'Desfavoritar' : 'Favoritar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePin(session.id)}>
                          <Pin className="w-3 h-3 mr-2" />
                          {session.pinned ? 'Desafixar' : 'Fixar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteSession(session.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-2 space-y-1">
                    {session.last_message_preview && (
                      <p className="text-xs text-white/60 line-clamp-2">
                        {session.last_message_preview}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{formatDistanceToNow(new Date(session.updated_at), { locale: ptBR })}</span>
                      {session.message_count && (
                        <Badge variant="outline" className="text-xs h-4">
                          {session.message_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 border-b border-white/10 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{currentSession.title}</h3>
                    <p className="text-sm text-white/60">Alex IA • Sistema Cognitivo Premium</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Online
                </Badge>
              </div>
            </div>

            {/* Área de Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`max-w-[70%] rounded-xl p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-white border border-white/10'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                          <span className="text-xs text-white/60">
                            {formatMessageTime(message.created_at)}
                          </span>
                          {message.llm_model && (
                            <Badge variant="outline" className="text-xs">
                              {message.llm_model}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 text-white border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-white/60 text-sm">Alex IA está pensando...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-white/10 bg-gray-900/50">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem para Alex IA..."
                  disabled={isTyping}
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-white/40"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Estado Inicial */
          <div className="flex-1 flex items-center justify-center">
            <Card className="bg-gray-900/50 border-white/10 text-center max-w-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Bem-vindo ao Chat Alex IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70">
                  Inicie uma nova conversa para começar a interagir com a Alex IA.
                </p>
                <Button 
                  onClick={handleCreateSession}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conversa
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

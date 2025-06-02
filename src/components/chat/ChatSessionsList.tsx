
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  MessageCircle, 
  Star, 
  StarOff, 
  Edit3, 
  Trash2,
  Check,
  X,
  Pin
} from 'lucide-react';
import { ChatSession } from '@/hooks/useChatSessions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatSessionsListProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onToggleFavorite: (sessionId: string) => void;
  loading?: boolean;
}

const ChatSessionsList = ({
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onToggleFavorite,
  loading = false
}: ChatSessionsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoritesSessions = filteredSessions.filter(s => s.is_favorite);
  const pinnedSessions = filteredSessions.filter(s => s.pinned);
  const regularSessions = filteredSessions.filter(s => !s.is_favorite && !s.pinned);

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveEditing = () => {
    if (editingId && editingTitle.trim()) {
      onRenameSession(editingId, editingTitle.trim());
    }
    cancelEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const SessionItem = ({ session }: { session: ChatSession }) => {
    const isActive = currentSession?.id === session.id;
    const isEditing = editingId === session.id;

    return (
      <div
        className={cn(
          "group relative p-3 rounded-xl cursor-pointer transition-all duration-200",
          "hover:bg-white/5 border border-transparent",
          isActive && "bg-white/10 border-white/20"
        )}
        onClick={() => !isEditing && onSessionSelect(session)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEditing}
                  className="h-6 text-sm bg-white/5 border-white/20 text-white"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveEditing}
                  className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEditing}
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-white text-sm truncate">
                    {session.title}
                  </h3>
                  {session.is_favorite && (
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  )}
                  {session.pinned && (
                    <Pin className="h-3 w-3 text-blue-400" />
                  )}
                </div>
                
                {session.last_message_preview && (
                  <p className="text-xs text-white/60 truncate mb-2">
                    {session.last_message_preview}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {session.message_count}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(session.updated_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(session.id);
                }}
                className="h-6 w-6 p-0 text-white/60 hover:text-yellow-400"
              >
                {session.is_favorite ? (
                  <StarOff className="h-3 w-3" />
                ) : (
                  <Star className="h-3 w-3" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(session);
                }}
                className="h-6 w-6 p-0 text-white/60 hover:text-blue-400"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir "{session.title}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteSession(session.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-black border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button
          onClick={onNewSession}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {loading ? (
            <div className="text-center text-white/60">
              Carregando conversas...
            </div>
          ) : (
            <>
              {/* Favoritas */}
              {favoritesSessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Favoritas
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {favoritesSessions.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {favoritesSessions.map(session => (
                      <SessionItem key={session.id} session={session} />
                    ))}
                  </div>
                </div>
              )}

              {/* Fixadas */}
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="h-4 w-4 text-blue-400" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Fixadas
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {pinnedSessions.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {pinnedSessions.map(session => (
                      <SessionItem key={session.id} session={session} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recentes */}
              {regularSessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="h-4 w-4 text-white/60" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Recentes
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {regularSessions.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {regularSessions.map(session => (
                      <SessionItem key={session.id} session={session} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredSessions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60 mb-2">
                    {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                  </p>
                  <p className="text-white/40 text-sm">
                    {searchQuery ? 'Tente outros termos de busca' : 'Clique em "Novo Chat" para começar'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSessionsList;

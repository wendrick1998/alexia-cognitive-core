
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
  Pin,
  PinOff,
  RotateCcw
} from 'lucide-react';
import { AlexChatSession } from '@/hooks/useAlexChatSessions';
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

interface AlexSessionsListProps {
  sessions: AlexChatSession[];
  currentSession: AlexChatSession | null;
  onSessionSelect: (session: AlexChatSession) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onToggleFavorite: (sessionId: string) => void;
  onTogglePin: (sessionId: string) => void;
  onResetAll: () => void;
  loading?: boolean;
}

const AlexSessionsList = ({
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onToggleFavorite,
  onTogglePin,
  onResetAll,
  loading = false
}: AlexSessionsListProps) => {
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

  const startEditing = (session: AlexChatSession) => {
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

  const SessionItem = ({ session }: { session: AlexChatSession }) => {
    const isActive = currentSession?.id === session.id;
    const isEditing = editingId === session.id;

    return (
      <div
        className={cn(
          "group relative p-4 rounded-xl cursor-pointer transition-all duration-200",
          "hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 border border-transparent",
          "hover:border-white/20 hover:shadow-lg",
          isActive && "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 shadow-lg"
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
                  className="h-8 text-sm bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveEditing}
                  className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-400/20"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEditing}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {session.title}
                  </h3>
                  {session.is_favorite && (
                    <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                  )}
                  {session.pinned && (
                    <Pin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
                
                {session.last_message_preview && (
                  <p className="text-xs text-white/70 truncate mb-3 leading-relaxed">
                    {session.last_message_preview}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {session.message_count} mensagens
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
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(session.id);
                }}
                className="h-8 w-8 p-0 text-white/60 hover:text-blue-400 hover:bg-blue-400/20"
                title={session.pinned ? "Desafixar" : "Fixar"}
              >
                {session.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(session.id);
                }}
                className="h-8 w-8 p-0 text-white/60 hover:text-yellow-400 hover:bg-yellow-400/20"
                title={session.is_favorite ? "Remover dos favoritos" : "Favoritar"}
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
                className="h-8 w-8 p-0 text-white/60 hover:text-blue-400 hover:bg-blue-400/20"
                title="Renomear"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 text-white/60 hover:text-red-400 hover:bg-red-400/20"
                    title="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Excluir conversa</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Tem certeza que deseja excluir "{session.title}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteSession(session.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
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
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-black border-r border-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Alex IA</h1>
              <p className="text-xs text-white/60">Assistente Inteligente</p>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-red-400 hover:bg-red-400/20"
                title="Reset Completo"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Reset Completo</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Esta ação irá excluir TODAS as suas conversas com Alex IA. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onResetAll}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reset Completo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Button
          onClick={onNewSession}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
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
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {loading ? (
            <div className="text-center text-white/60 py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Carregando conversas...
            </div>
          ) : (
            <>
              {/* Favoritas */}
              {favoritesSessions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Favoritas
                    </h2>
                    <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
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
                  <div className="flex items-center gap-2 mb-4">
                    <Pin className="h-4 w-4 text-blue-400" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Fixadas
                    </h2>
                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
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
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="h-4 w-4 text-white/60" />
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Recentes
                    </h2>
                    <Badge variant="secondary" className="text-xs bg-white/10 text-white/60 border-white/20">
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
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-white/60 mb-2 font-medium">
                    {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                  </p>
                  <p className="text-white/40 text-sm">
                    {searchQuery ? 'Tente outros termos de busca' : 'Clique em "Nova Conversa" para começar a conversar com Alex IA'}
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

export default AlexSessionsList;

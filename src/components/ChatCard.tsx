
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MessageCircle,
  MoreVertical,
  Star,
  Archive,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  Hash
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Conversation } from "@/hooks/useConversations";

interface ChatCardProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onRename: (id: string, name: string) => void;
  onFavorite: (id: string, favorite: boolean) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChatCard = ({
  conversation,
  isActive,
  onClick,
  onRename,
  onFavorite,
  onArchive,
  onDelete,
}: ChatCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(conversation.name || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRename = () => {
    if (editName.trim() && editName !== conversation.name) {
      onRename(conversation.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditName(conversation.name || "");
      setIsEditing(false);
    }
  };

  const categoryColor = conversation.category?.color || '#64748B';

  return (
    <>
      <div
        onClick={onClick}
        className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] border-2 ${
          isActive
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg'
            : 'hover:bg-slate-50 border-transparent hover:border-slate-200 hover:shadow-md'
        }`}
      >
        {/* Indicador de categoria */}
        {conversation.category && (
          <div 
            className="absolute -left-1 top-4 w-1 h-8 rounded-r-full"
            style={{ backgroundColor: categoryColor }}
          />
        )}

        {/* Cabeçalho do card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isActive ? 'bg-blue-500' : 'bg-slate-300'
            }`} />
            
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyPress}
                className="h-6 text-sm font-medium border-none p-0 focus-visible:ring-0"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className={`text-sm font-medium truncate ${
                isActive ? 'text-blue-900' : 'text-slate-800'
              }`}>
                {conversation.name || 'Nova Conversa'}
              </h3>
            )}

            {conversation.is_favorite && (
              <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0 text-slate-400 hover:text-slate-600 transition-opacity"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onFavorite(conversation.id, !conversation.is_favorite)}
              >
                <Star className="w-4 h-4 mr-2" />
                {conversation.is_favorite ? 'Remover favorito' : 'Favoritar'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(conversation.id)}>
                <Archive className="w-4 h-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview da última mensagem */}
        {conversation.last_message_preview && (
          <p className={`text-xs mb-3 line-clamp-2 ${
            isActive ? 'text-blue-700' : 'text-slate-600'
          }`}>
            {conversation.last_message_preview}
          </p>
        )}

        {/* Tags */}
        {conversation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {conversation.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0 h-5 bg-slate-100 text-slate-600"
              >
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {conversation.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                +{conversation.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Rodapé com metadados */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3 text-slate-500">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{conversation.message_count}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>
                {formatDistanceToNow(new Date(conversation.updated_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
          </div>

          {conversation.category && (
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-0 h-5 border-current"
              style={{ color: categoryColor, borderColor: categoryColor }}
            >
              {conversation.category.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(conversation.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatCard;

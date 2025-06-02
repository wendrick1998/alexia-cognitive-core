
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit3, Pin, PinOff, Trash2 } from 'lucide-react';
import { Conversation } from '@/hooks/useConversations';

interface ConversationMenuProps {
  conversation: Conversation;
  onRename: (conversationId: string, newName: string) => void;
  onTogglePin: (conversationId: string, isPinned: boolean) => void;
  onDelete: (conversationId: string) => void;
}

const ConversationMenu = ({ conversation, onRename, onTogglePin, onDelete }: ConversationMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newName, setNewName] = useState(conversation.name || '');

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== conversation.name) {
      onRename(conversation.id, newName.trim());
    }
    setShowRenameDialog(false);
  };

  const handleDelete = () => {
    onDelete(conversation.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Renomear
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTogglePin(conversation.id, !conversation.is_favorite)}>
            {conversation.is_favorite ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                Desafixar
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                Fixar no topo
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Apagar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Renomear */}
      <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renomear Conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Digite um novo nome para esta conversa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome da conversa"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>
              Renomear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar esta conversa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationMenu;

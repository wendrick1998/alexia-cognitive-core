
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Folder,
  FolderOpen,
  MoreVertical,
  ChevronRight,
  Hash,
  Star,
  Archive
} from "lucide-react";
import { ConversationCategory, Conversation } from "@/hooks/useConversations";
import ChatCard from "./ChatCard";

interface CategoryManagerProps {
  categories: ConversationCategory[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateCategory: (name: string, color: string) => void;
  onRenameConversation: (id: string, name: string) => void;
  onFavoriteConversation: (id: string, favorite: boolean) => void;
  onArchiveConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const CategoryManager = ({
  categories,
  conversations,
  currentConversation,
  onSelectConversation,
  onCreateCategory,
  onRenameConversation,
  onFavoriteConversation,
  onArchiveConversation,
  onDeleteConversation,
}: CategoryManagerProps) => {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

  const toggleCategory = (categoryId: string) => {
    const newOpen = new Set(openCategories);
    if (newOpen.has(categoryId)) {
      newOpen.delete(categoryId);
    } else {
      newOpen.add(categoryId);
    }
    setOpenCategories(newOpen);
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim(), selectedColor);
      setNewCategoryName("");
      setSelectedColor(CATEGORY_COLORS[0]);
      setShowCreateDialog(false);
    }
  };

  // Agrupar conversas por categoria
  const uncategorizedConversations = conversations.filter(conv => !conv.category_id);
  const favoriteConversations = conversations.filter(conv => conv.is_favorite);
  
  const conversationsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = conversations.filter(conv => conv.category_id === category.id);
    return acc;
  }, {} as Record<string, Conversation[]>);

  const renderConversationCard = (conversation: Conversation) => (
    <ChatCard
      key={conversation.id}
      conversation={conversation}
      isActive={currentConversation?.id === conversation.id}
      onClick={() => onSelectConversation(conversation)}
      onRename={onRenameConversation}
      onFavorite={onFavoriteConversation}
      onArchive={onArchiveConversation}
      onDelete={onDeleteConversation}
    />
  );

  return (
    <div className="space-y-4">
      {/* Seção de Favoritos */}
      {favoriteConversations.length > 0 && (
        <Collapsible
          open={openCategories.has('favorites')}
          onOpenChange={() => toggleCategory('favorites')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50 group">
            <div className="flex items-center space-x-2">
              <ChevronRight 
                className={`w-4 h-4 transition-transform ${
                  openCategories.has('favorites') ? 'rotate-90' : ''
                }`} 
              />
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-sm">Favoritos</span>
              <Badge variant="secondary" className="text-xs">
                {favoriteConversations.length}
              </Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 ml-6 mt-2">
            {favoriteConversations.map(renderConversationCard)}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Categorias personalizadas */}
      {categories.map((category) => {
        const categoryConversations = conversationsByCategory[category.id] || [];
        if (categoryConversations.length === 0) return null;

        return (
          <Collapsible
            key={category.id}
            open={openCategories.has(category.id)}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50 group">
              <div className="flex items-center space-x-2">
                <ChevronRight 
                  className={`w-4 h-4 transition-transform ${
                    openCategories.has(category.id) ? 'rotate-90' : ''
                  }`} 
                />
                {openCategories.has(category.id) ? (
                  <FolderOpen className="w-4 h-4" style={{ color: category.color }} />
                ) : (
                  <Folder className="w-4 h-4" style={{ color: category.color }} />
                )}
                <span className="font-medium text-sm">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryConversations.length}
                </Badge>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Renomear categoria</DropdownMenuItem>
                  <DropdownMenuItem>Alterar cor</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Excluir categoria</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 ml-6 mt-2">
              {categoryConversations.map(renderConversationCard)}
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Conversas sem categoria */}
      {uncategorizedConversations.length > 0 && (
        <Collapsible
          open={openCategories.has('uncategorized')}
          onOpenChange={() => toggleCategory('uncategorized')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <ChevronRight 
                className={`w-4 h-4 transition-transform ${
                  openCategories.has('uncategorized') ? 'rotate-90' : ''
                }`} 
              />
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-sm text-slate-600">Outras conversas</span>
              <Badge variant="secondary" className="text-xs">
                {uncategorizedConversations.length}
              </Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 ml-6 mt-2">
            {uncategorizedConversations.map(renderConversationCard)}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Botão para criar nova categoria */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-slate-600 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova categoria
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar nova categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da categoria</label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Projetos, Pesquisa, Ideias..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cor</label>
              <div className="flex gap-2 mt-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-slate-400' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCategory} className="flex-1">
                Criar categoria
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;

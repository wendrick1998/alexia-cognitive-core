
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Plus,
  X,
  Search,
  Filter,
  MoreVertical,
  Star,
  Archive,
  Clock,
  Folder,
  TrendingUp,
  Settings,
  Loader2
} from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import CategoryManager from "./CategoryManager";
import ChatCard from "./ChatCard";
import { ConversationCardSkeleton } from "./chat/ChatSkeleton";

interface ConversationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

type SortOption = 'updated' | 'created' | 'name' | 'messages';
type FilterOption = 'all' | 'favorites' | 'recent' | 'active';

const ConversationSidebar = ({ isOpen, onToggle }: ConversationSidebarProps) => {
  const { user } = useAuth();
  const { 
    conversations,
    categories,
    currentConversation,
    searchQuery,
    setSearchQuery,
    conversationState,
    createAndNavigateToNewConversation,
    navigateToConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    favoriteConversation,
    createCategory,
    loadConversations,
    loadCategories
  } = useConversations();

  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoadingConversations(true);
      Promise.all([loadConversations(), loadCategories()])
        .finally(() => setIsLoadingConversations(false));
    }
  }, [user]);

  const handleNewConversation = async () => {
    await createAndNavigateToNewConversation();
    setActiveTab('all');
  };

  const handleSelectConversation = async (conversation: any) => {
    await navigateToConversation(conversation);
  };

  const handleRenameConversation = async (id: string, name: string) => {
    await updateConversation(id, { name });
  };

  const handleFavoriteConversation = async (id: string, favorite: boolean) => {
    await favoriteConversation(id, favorite);
  };

  const handleArchiveConversation = async (id: string) => {
    await archiveConversation(id);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
  };

  const handleCreateCategory = async (name: string, color: string) => {
    await createCategory(name, color, 'folder');
  };

  // Filtrar e ordenar conversas
  const getFilteredAndSortedConversations = () => {
    let filtered = [...conversations];

    // Aplicar filtros
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(conv => conv.is_favorite);
        break;
      case 'recent':
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        filtered = filtered.filter(conv => new Date(conv.updated_at) > threeDaysAgo);
        break;
      case 'active':
        filtered = filtered.filter(conv => conv.message_count > 0);
        break;
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'created':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'messages':
        filtered.sort((a, b) => b.message_count - a.message_count);
        break;
      default: // 'updated'
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }

    return filtered;
  };

  const filteredConversations = getFilteredAndSortedConversations();
  const recentConversations = conversations.slice(0, 5);
  const favoriteConversations = conversations.filter(conv => conv.is_favorite);

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-white/95 backdrop-blur-sm border-r border-slate-200/60 flex flex-col shadow-xl">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Conversas</h2>
            {conversationState.isNavigating && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <Button
          onClick={handleNewConversation}
          disabled={conversationState.isCreatingNew}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:opacity-70"
          size="sm"
        >
          {conversationState.isCreatingNew ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Nova Conversa
            </>
          )}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-slate-200/60 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-slate-200 focus:border-blue-500"
            disabled={isLoadingConversations}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl" disabled={isLoadingConversations}>
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                Todas as conversas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('favorites')}>
                <Star className="w-4 h-4 mr-2" />
                Favoritas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('recent')}>
                <Clock className="w-4 h-4 mr-2" />
                Recentes (3 dias)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('active')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Ativas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl" disabled={isLoadingConversations}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('updated')}>
                Ordenar por atualização
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('created')}>
                Ordenar por criação
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Ordenar por nome
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('messages')}>
                Ordenar por atividade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter and Sort Indicators */}
        <div className="flex flex-wrap gap-2">
          {filterBy !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Filtro: {filterBy === 'favorites' ? 'Favoritas' : 
                     filterBy === 'recent' ? 'Recentes' : 'Ativas'}
            </Badge>
          )}
          {sortBy !== 'updated' && (
            <Badge variant="outline" className="text-xs">
              Ordem: {sortBy === 'created' ? 'Criação' : 
                     sortBy === 'name' ? 'Nome' : 'Atividade'}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
          <TabsTrigger value="all" disabled={isLoadingConversations}>Todas</TabsTrigger>
          <TabsTrigger value="categories" disabled={isLoadingConversations}>Categorias</TabsTrigger>
          <TabsTrigger value="recent" disabled={isLoadingConversations}>Recentes</TabsTrigger>
        </TabsList>

        {/* All Conversations Tab */}
        <TabsContent value="all" className="flex-1 mt-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {isLoadingConversations ? (
                // Mostrar skeletons durante carregamento
                Array.from({ length: 3 }).map((_, index) => (
                  <ConversationCardSkeleton key={index} />
                ))
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {searchQuery ? (
                      <Search className="w-8 h-8 opacity-50" />
                    ) : (
                      <MessageCircle className="w-8 h-8 opacity-50" />
                    )}
                  </div>
                  <p className="text-base font-medium mb-2">
                    {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                  </p>
                  <p className="text-sm">
                    {searchQuery ? 'Tente ajustar os filtros de busca' : 'Comece uma nova conversa para começar!'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <ChatCard
                    key={conversation.id}
                    conversation={conversation}
                    isActive={currentConversation?.id === conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    onRename={handleRenameConversation}
                    onFavorite={handleFavoriteConversation}
                    onArchive={handleArchiveConversation}
                    onDelete={handleDeleteConversation}
                    disabled={conversationState.isNavigating}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="flex-1 mt-0">
          <ScrollArea className="flex-1 p-4">
            {isLoadingConversations ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <ConversationCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <CategoryManager
                categories={categories}
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={handleSelectConversation}
                onCreateCategory={handleCreateCategory}
                onRenameConversation={handleRenameConversation}
                onFavoriteConversation={handleFavoriteConversation}
                onArchiveConversation={handleArchiveConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            )}
          </ScrollArea>
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent" className="flex-1 mt-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Favoritas ({favoriteConversations.length})
                </h3>
                <div className="space-y-2">
                  {isLoadingConversations ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <ConversationCardSkeleton key={index} />
                    ))
                  ) : (
                    favoriteConversations.slice(0, 3).map((conversation) => (
                      <ChatCard
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversation?.id === conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        onRename={handleRenameConversation}
                        onFavorite={handleFavoriteConversation}
                        onArchive={handleArchiveConversation}
                        onDelete={handleDeleteConversation}
                        disabled={conversationState.isNavigating}
                      />
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Recentes
                </h3>
                <div className="space-y-2">
                  {isLoadingConversations ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <ConversationCardSkeleton key={index} />
                    ))
                  ) : (
                    recentConversations.map((conversation) => (
                      <ChatCard
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversation?.id === conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        onRename={handleRenameConversation}
                        onFavorite={handleFavoriteConversation}
                        onArchive={handleArchiveConversation}
                        onDelete={handleDeleteConversation}
                        disabled={conversationState.isNavigating}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Stats Footer */}
      <div className="p-4 border-t border-slate-200/60 bg-slate-50/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-slate-800">
              {isLoadingConversations ? '-' : conversations.length}
            </div>
            <div className="text-xs text-slate-500">Conversas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {isLoadingConversations ? '-' : favoriteConversations.length}
            </div>
            <div className="text-xs text-slate-500">Favoritas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {isLoadingConversations ? '-' : categories.length}
            </div>
            <div className="text-xs text-slate-500">Categorias</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationSidebar;

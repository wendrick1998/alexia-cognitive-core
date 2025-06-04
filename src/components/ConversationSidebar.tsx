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
  Loader2,
  Sparkles
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
    console.log('🆕 Nova conversa solicitada via sidebar');
    await createAndNavigateToNewConversation();
    setActiveTab('all');
  };

  const handleSelectConversation = async (conversation: any) => {
    console.log(`🎯 Conversa selecionada via sidebar: ${conversation.id}`);
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

  const getFilteredAndSortedConversations = () => {
    let filtered = [...conversations];

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
      default:
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }

    return filtered;
  };

  const filteredConversations = getFilteredAndSortedConversations();
  const recentConversations = conversations.slice(0, 5);
  const favoriteConversations = conversations.filter(conv => conv.is_favorite);
  const isDisabled = conversationState.isNavigating || conversationState.isCreatingNew;

  if (!isOpen) return null;

  return (
    <div className="w-full h-full flex flex-col bg-background/95 backdrop-blur-xl border-r border-border/30 shadow-xl">
      {/* Enhanced Premium Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/30 bg-gradient-to-r from-background via-background to-muted/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Conversas</h2>
              <p className="text-xs text-muted-foreground">IA Premium</p>
            </div>
            {conversationState.isNavigating && (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleNewConversation}
          disabled={isDisabled}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-70 h-10"
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

      {/* Compact Search and Filters */}
      <div className="flex-shrink-0 p-3 border-b border-border/20 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 focus:bg-background/80 transition-all duration-200 text-sm"
            disabled={isLoadingConversations || isDisabled}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-xl border-border/50 bg-background/50 hover:bg-muted/50 transition-all duration-200 text-xs" 
                disabled={isLoadingConversations || isDisabled}
              >
                <Filter className="w-3 h-3 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border/50">
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                Todas as conversas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('favorites')}>
                <Star className="w-4 h-4 mr-2" />
                Favoritas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('recent')}>
                <Clock className="w-4 h-4 mr-2" />
                Recentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('active')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Ativas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-xl border-border/50 bg-background/50 hover:bg-muted/50 transition-all duration-200" 
                disabled={isLoadingConversations || isDisabled}
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border/50">
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

        {/* Compact Filter Indicators */}
        {(filterBy !== 'all' || sortBy !== 'updated') && (
          <div className="flex flex-wrap gap-1">
            {filterBy !== 'all' && (
              <Badge variant="secondary" className="text-xs h-5 px-2 bg-muted/50 text-muted-foreground">
                {filterBy === 'favorites' ? 'Favoritas' : 
                 filterBy === 'recent' ? 'Recentes' : 'Ativas'}
              </Badge>
            )}
            {sortBy !== 'updated' && (
              <Badge variant="outline" className="text-xs h-5 px-2 border-border/50 bg-background/50">
                {sortBy === 'created' ? 'Criação' : 
                 sortBy === 'name' ? 'Nome' : 'Atividade'}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Compact Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 px-3 pt-2">
          <TabsList className="grid w-full grid-cols-3 h-8 bg-muted/30 backdrop-blur-sm">
            <TabsTrigger 
              value="all" 
              disabled={isLoadingConversations || isDisabled}
              className="text-xs data-[state=active]:bg-background/80 data-[state=active]:shadow-sm h-6"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              disabled={isLoadingConversations || isDisabled}
              className="text-xs data-[state=active]:bg-background/80 data-[state=active]:shadow-sm h-6"
            >
              Categorias
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              disabled={isLoadingConversations || isDisabled}
              className="text-xs data-[state=active]:bg-background/80 data-[state=active]:shadow-sm h-6"
            >
              Recentes
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="all" className="h-full mt-2">
            <ScrollArea className="h-full px-3 pb-3">
              <div className="space-y-1">
                {isLoadingConversations ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <ConversationCardSkeleton key={index} />
                  ))
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                      {searchQuery ? (
                        <Search className="w-6 h-6 opacity-50" />
                      ) : (
                        <MessageCircle className="w-6 h-6 opacity-50" />
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                    </p>
                    <p className="text-xs">
                      {searchQuery ? 'Tente outros termos' : 'Comece uma nova conversa'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <ChatCard
                      key={conversation.id}
                      conversation={conversation}
                      isActive={currentConversation?.id === conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      onRename={(id, name) => updateConversation(id, { name })}
                      onFavorite={(id, favorite) => favoriteConversation(id, favorite)}
                      onArchive={(id) => archiveConversation(id)}
                      onDelete={(id) => deleteConversation(id)}
                      disabled={isDisabled}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="categories" className="h-full mt-2">
            <ScrollArea className="h-full px-3 pb-3">
              {isLoadingConversations ? (
                <div className="space-y-1">
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
                  onCreateCategory={(name, color) => createCategory(name, color, 'folder')}
                  onRenameConversation={(id, name) => updateConversation(id, { name })}
                  onFavoriteConversation={(id, favorite) => favoriteConversation(id, favorite)}
                  onArchiveConversation={(id) => archiveConversation(id)}
                  onDeleteConversation={(id) => deleteConversation(id)}
                />
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="h-full mt-2">
            <ScrollArea className="h-full px-3 pb-3">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center px-1">
                    <Star className="w-3 h-3 mr-2 text-yellow-500" />
                    Favoritas ({favoriteConversations.length})
                  </h3>
                  <div className="space-y-1">
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
                          onRename={(id, name) => updateConversation(id, { name })}
                          onFavorite={(id, favorite) => favoriteConversation(id, favorite)}
                          onArchive={(id) => archiveConversation(id)}
                          onDelete={(id) => deleteConversation(id)}
                          disabled={isDisabled}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center px-1">
                    <Clock className="w-3 h-3 mr-2 text-primary" />
                    Recentes
                  </h3>
                  <div className="space-y-1">
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
                          onRename={(id, name) => updateConversation(id, { name })}
                          onFavorite={(id, favorite) => favoriteConversation(id, favorite)}
                          onArchive={(id) => archiveConversation(id)}
                          onDelete={(id) => deleteConversation(id)}
                          disabled={isDisabled}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Compact Stats Footer */}
      <div className="flex-shrink-0 p-3 border-t border-border/30 bg-muted/10 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground">
              {isLoadingConversations ? '-' : conversations.length}
            </div>
            <div className="text-xs text-muted-foreground">Conversas</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground">
              {isLoadingConversations ? '-' : favoriteConversations.length}
            </div>
            <div className="text-xs text-muted-foreground">Favoritas</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground">
              {isLoadingConversations ? '-' : categories.length}
            </div>
            <div className="text-xs text-muted-foreground">Categorias</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationSidebar;

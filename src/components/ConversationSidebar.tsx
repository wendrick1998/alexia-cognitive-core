
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  X, 
  Plus, 
  MoreHorizontal,
  Star,
  Archive,
  Trash2
} from 'lucide-react';

interface ConversationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ConversationSidebar = ({ isOpen, onToggle }: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Mock data - replace with real data from your store
  const conversations = [
    {
      id: '1',
      title: 'Desenvolvimento React',
      lastMessage: 'Como implementar dark mode...',
      timestamp: '2 min',
      isStarred: true,
      isArchived: false,
      messageCount: 15
    },
    {
      id: '2',
      title: 'Estratégia de Negócios',
      lastMessage: 'Análise de mercado e concorrência...',
      timestamp: '1 hora',
      isStarred: false,
      isArchived: false,
      messageCount: 8
    },
    {
      id: '3',
      title: 'Design System',
      lastMessage: 'Componentes padronizados...',
      timestamp: 'Ontem',
      isStarred: false,
      isArchived: false,
      messageCount: 23
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50 transform transition-transform duration-300 lg:relative lg:transform-none",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        !isOpen && "lg:w-0 lg:border-l-0 overflow-hidden"
      )}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Conversas</h2>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onToggle}
                  className="w-8 h-8 p-0 lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-input"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                        selectedConversation === conversation.id && "bg-accent"
                      )}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-sm text-foreground truncate flex-1">
                          {conversation.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {conversation.isStarred && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {conversation.lastMessage}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {conversation.messageCount}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-auto p-1">
                <Archive className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-auto p-1">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;

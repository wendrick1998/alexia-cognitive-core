
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  ArrowLeft,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Conversation } from '@/hooks/useConversations';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isMobile: boolean;
  onToggleView?: () => void;
}

const ConversationsList = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation,
  isMobile,
  onToggleView
}: ConversationsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      lastWeek: [] as Conversation[],
      lastMonth: [] as Conversation[],
      older: [] as Conversation[]
    };

    conversations.forEach(conv => {
      const convDate = new Date(conv.updated_at);
      
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday) {
        groups.yesterday.push(conv);
      } else if (convDate >= lastWeek) {
        groups.lastWeek.push(conv);
      } else if (convDate >= lastMonth) {
        groups.lastMonth.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (date >= today) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);

  const ConversationCard = ({ conversation }: { conversation: Conversation }) => {
    const isActive = currentConversation?.id === conversation.id;
    
    return (
      <button
        onClick={() => onConversationSelect(conversation)}
        className={cn(
          "w-full p-3 text-left rounded-xl transition-all duration-200 group relative overflow-hidden mb-1",
          isActive 
            ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-2 border-blue-400" 
            : "hover:bg-white/5"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-white truncate flex-1 mr-2 leading-tight">
            {conversation.name || 'Nova Conversa'}
          </h3>
          <span className="text-xs text-white/40 flex-shrink-0 font-mono">
            {formatTime(conversation.updated_at)}
          </span>
        </div>
        
        {conversation.last_message_preview && (
          <p className="text-xs text-white/60 truncate leading-relaxed">
            {conversation.last_message_preview}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1 text-xs text-white/40">
            <MessageCircle className="w-3 h-3" />
            <span>{conversation.message_count || 0}</span>
          </div>
          {isActive && (
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          )}
        </div>
        
        {/* Gradient border for hover */}
        {!isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-0 bg-gradient-to-b from-blue-400 to-purple-400 transition-all duration-200 group-hover:w-0.5 rounded-r" />
        )}
      </button>
    );
  };

  const GroupSection = ({ 
    id,
    title, 
    conversations, 
    isCollapsible = false 
  }: { 
    id: string;
    title: string; 
    conversations: Conversation[];
    isCollapsible?: boolean;
  }) => {
    const isExpanded = !collapsedSections.has(id);
    
    if (conversations.length === 0) return null;

    return (
      <div className="space-y-2 mb-6">
        <button
          onClick={() => isCollapsible && toggleSection(id)}
          className={cn(
            "flex items-center justify-between w-full text-xs font-semibold text-white/60 uppercase tracking-wider",
            isCollapsible && "hover:text-white/80 transition-colors"
          )}
        >
          <span>{title}</span>
          {isCollapsible && (
            <div className="flex items-center space-x-1">
              <span className="text-white/40">({conversations.length})</span>
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
          )}
        </button>
        
        {isExpanded && (
          <div className="space-y-1">
            {conversations.map(conv => (
              <ConversationCard key={conv.id} conversation={conv} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      {/* Header Premium */}
      <div className="p-4 border-b border-white/10">
        {isMobile && onToggleView && (
          <div className="flex items-center mb-4">
            <Button
              onClick={onToggleView}
              variant="ghost"
              size="sm"
              className="p-2 text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="ml-2 text-lg font-semibold text-white">Conversas</h1>
          </div>
        )}
        
        {/* New Conversation Button Premium */}
        <Button
          onClick={onNewConversation}
          className="w-full mb-4 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white border-0 rounded-xl h-11 font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
        
        {/* Search Premium */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all"
          />
        </div>
      </div>

      {/* Conversations List Premium */}
      <ScrollArea className="flex-1 p-4" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.2) transparent'
      }}>
        <div className="space-y-2">
          <GroupSection id="today" title="Hoje" conversations={groupedConversations.today} />
          <GroupSection id="yesterday" title="Ontem" conversations={groupedConversations.yesterday} />
          <GroupSection id="lastWeek" title="Últimos 7 dias" conversations={groupedConversations.lastWeek} />
          <GroupSection id="lastMonth" title="Últimos 30 dias" conversations={groupedConversations.lastMonth} isCollapsible />
          <GroupSection id="older" title="Mais antigos" conversations={groupedConversations.older} isCollapsible />
        </div>
        
        {filteredConversations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-white/60 font-medium mb-2">
              {searchQuery ? 'Nenhuma conversa encontrada' : 'Suas conversas aparecerão aqui'}
            </h3>
            <p className="text-white/40 text-sm">
              {searchQuery ? 'Tente usar termos diferentes' : 'Clique em "Nova Conversa" para começar'}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationsList;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumCard } from '@/components/ui/premium-card';
import { Plus, Search, Clock, MessageCircle } from 'lucide-react';
import { Conversation } from '@/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
}: ConversationsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Group conversations by date
  const groupConversationsByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: { [key: string]: Conversation[] } = {
      hoje: [],
      ontem: [],
      'últimos-7-dias': [],
      'últimos-30-dias': [],
      mais: []
    };

    conversations
      .filter(conv => 
        conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === ''
      )
      .forEach(conv => {
        const convDate = new Date(conv.created_at);
        
        if (convDate >= today) {
          groups.hoje.push(conv);
        } else if (convDate >= yesterday) {
          groups.ontem.push(conv);
        } else if (convDate >= week) {
          groups['últimos-7-dias'].push(conv);
        } else if (convDate >= month) {
          groups['últimos-30-dias'].push(conv);
        } else {
          groups.mais.push(conv);
        }
      });

    return groups;
  };

  const groupedConversations = groupConversationsByDate();

  const getGroupTitle = (key: string) => {
    const titles: { [key: string]: string } = {
      hoje: 'Hoje',
      ontem: 'Ontem',
      'últimos-7-dias': 'Últimos 7 dias',
      'últimos-30-dias': 'Últimos 30 dias',
      mais: 'Mais antigas'
    };
    return titles[key];
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col bg-transparent animate-premium-fade-in">
      {/* Header Premium */}
      <div className="p-6 border-b border-white/5">
        <button
          onClick={onNewConversation}
          className="w-full btn-primary mb-4 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="font-medium">Nova conversa</span>
          </div>
        </button>
        
        <PremiumInput
          type="text"
          placeholder="Buscar conversas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="text-sm"
        />
      </div>

      {/* Conversations List Premium */}
      <div className="flex-1 overflow-y-auto premium-scrollbar px-3">
        {Object.entries(groupedConversations).map(([key, convs]) => {
          if (convs.length === 0) return null;
          
          return (
            <div key={key} className="mb-6 animate-premium-scale-in">
              <h3 className="text-caption font-medium px-3 mb-3 uppercase tracking-wider">
                {getGroupTitle(key)}
              </h3>
              
              <div className="space-y-2">
                {convs.map((conversation) => {
                  const isActive = currentConversation?.id === conversation.id;
                  const timeAgo = formatDistanceToNow(new Date(conversation.created_at), {
                    addSuffix: false,
                    locale: ptBR
                  });
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => onConversationSelect(conversation)}
                      className={`
                        relative p-4 rounded-lg cursor-pointer group transition-all duration-300
                        hover:bg-white/5 hover-lift
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' 
                          : 'bg-white/[0.02] border border-transparent hover:border-white/10'
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${isActive 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                            : 'bg-white/5 group-hover:bg-white/10'
                          }
                        `}>
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`
                              font-medium text-sm truncate
                              ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}
                            `}>
                              {truncateText(conversation.name || 'Nova conversa', 25)}
                            </h4>
                            
                            <div className="flex items-center gap-1 text-xs text-white/40 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              <span>{timeAgo}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-white/50 truncate">
                            {conversation.message_count > 0 
                              ? `${conversation.message_count} mensagens`
                              : 'Sem mensagens'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {conversations.length === 0 && (
          <PremiumCard variant="interactive" className="text-center py-12">
            <div className="empty-state-icon mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-title text-sm mb-2">Nenhuma conversa ainda</h3>
            <p className="text-caption text-xs">
              Comece uma nova conversa para ver suas discussões aqui
            </p>
          </PremiumCard>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;

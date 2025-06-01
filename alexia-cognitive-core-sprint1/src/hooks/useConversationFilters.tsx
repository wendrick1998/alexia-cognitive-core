
import { useState } from 'react';
import { Conversation } from './useConversationsData';

export function useConversationFilters(conversations: Conversation[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      conv.name?.toLowerCase().includes(query) ||
      conv.last_message_preview?.toLowerCase().includes(query) ||
      conv.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return {
    searchQuery,
    setSearchQuery,
    filteredConversations,
  };
}

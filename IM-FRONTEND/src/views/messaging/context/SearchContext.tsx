import React, { createContext, useContext, useState, useMemo } from 'react';
import { IChat } from '../components/types';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterChats: (chats: IChat[]) => IChat[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * Provides a search context for filtering chats based on a search query
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactNode} - Wrapped child components
 */
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filterChats = useMemo(() => {
    return (chats: IChat[]) => {
      if (!searchQuery.trim()) return chats;

      const query = searchQuery.toLowerCase().trim();
      return chats.filter((chat) => {
        // Search in participant usernames
        const participantMatch = chat.participants.some((p) => {
          return p.username.toLowerCase().includes(query);
        });

        // Search in last message
        const lastMessageMatch = chat.lastMessage?.toLowerCase().includes(query);

        // Search in group name if it's a group chat
        const groupNameMatch = chat.type === 'group' && chat.name?.toLowerCase().includes(query);

        return participantMatch || lastMessageMatch || groupNameMatch;
      });
    };
  }, [searchQuery]);

  const value = {
    searchQuery: searchQuery,
    setSearchQuery: setSearchQuery,
    filterChats: filterChats
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

/**
 * Custom hook for accessing the search context
 * @returns {SearchContextType} - Search context values
 */
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

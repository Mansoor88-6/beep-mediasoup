/* eslint-disable no-magic-numbers */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
// import { RootState } from 'appRedux/store';
import ChatListItem from './ChatListItem';
import { IChat, IChatListProps } from '../types';
import { Skeletons } from 'components';
import { RootState } from 'appRedux/reducers';
import { useSearch } from '../../context/SearchContext';

/**
 * Component that renders a list of chats
 * @param {IChatListProps} props - Component props
 * @returns {React.FC} Returns ChatList component
 */
const ChatList: React.FC<IChatListProps> = ({ onChatSelect }) => {
  const { chats, loading, activeChat } = useSelector((state: RootState) => {
    return state.messages;
  });
  const { filterChats } = useSearch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Filter and sort chats
  const sortedChats = useMemo(() => {
    const individualChats = Object.values(chats).filter((chat: IChat) => {
      return chat.type === 'individual';
    });

    // Apply search filter
    const filtered = filterChats(individualChats);

    // Sort chats based on unread messages and timestamp
    return filtered.sort((a, b) => {
      const aUnread = currentUser ? a.unreadCount?.[currentUser._id] || 0 : 0;
      const bUnread = currentUser ? b.unreadCount?.[currentUser._id] || 0 : 0;

      // First, sort by unread status
      if (aUnread > 0 && bUnread === 0) return -1;
      if (bUnread > 0 && aUnread === 0) return 1;

      // Then sort by timestamp
      const aTime = new Date(a.updatedAt || 0).getTime();
      const bTime = new Date(b.updatedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [chats, filterChats, currentUser]);

  return (
    <div className="flex flex-col h-[calc(100vh-170px)]">
      <div className="flex-1 overflow-y-auto chat-list-scroll">
        {loading && <Skeletons.ChatItemSkeleton />}
        {!loading &&
          sortedChats.length > 0 &&
          sortedChats.map((chat) => {
            return (
              <ChatListItem
                key={chat._id}
                chat={chat}
                onChatSelect={onChatSelect}
                isActive={chat._id === activeChat}
              />
            );
          })}
        {!loading && sortedChats.length === 0 && (
          <div className="flex justify-center items-center h-full text-gray-500">
            {Object.keys(chats).length === 0 ? 'No chats available' : 'No matching chats found'}
          </div>
        )}
      </div>
      <style>
        {`
          .chat-list-scroll::-webkit-scrollbar {
            width: 4px;
          }
          
          .chat-list-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .chat-list-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 20px;
          }
          
          .chat-list-scroll::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          
          .chat-list-scroll {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
            scroll-behavior: smooth;
          }
        `}
      </style>
    </div>
  );
};

export default ChatList;

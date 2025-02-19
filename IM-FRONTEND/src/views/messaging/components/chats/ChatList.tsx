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

  // Filter to show only individual chats and apply search filter
  const filteredChats = useMemo(() => {
    const individualChats = Object.values(chats).filter((chat: IChat) => {
      return chat.type === 'individual';
    });
    return filterChats(individualChats);
  }, [chats, filterChats]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {loading && <Skeletons.ChatItemSkeleton />}
        {!loading &&
          filteredChats.length > 0 &&
          filteredChats.map((chat) => {
            return (
              <ChatListItem
                key={chat._id}
                chat={chat}
                onChatSelect={onChatSelect}
                isActive={chat._id === activeChat}
              />
            );
          })}
        {!loading && filteredChats.length === 0 && (
          <div className="flex justify-center items-center h-full text-gray-500">
            {Object.keys(chats).length === 0 ? 'No chats available' : 'No matching chats found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

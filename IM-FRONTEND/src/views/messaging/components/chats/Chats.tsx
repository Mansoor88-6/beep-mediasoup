import React from 'react';
import ChatList from './ChatList';
import { IChatListProps } from '../types';

/**
 * Chats
 * @param {IChatListProps} props - props
 * @returns {React.FC} - returns
 */
const Chats: React.FC<IChatListProps> = (props) => {
  return <ChatList {...props} />;
};

export default Chats;

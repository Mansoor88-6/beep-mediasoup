/* eslint-disable react/prop-types */
import React from 'react';
import { Avatar, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from 'appRedux/store';
import { IGroupListItemProps } from '../types';
import { ONE, THREE, ZERO } from 'constant';

/**
 * Component that renders a single group chat item
 * @param {IGroupListItemProps} props - Component props
 * @returns {React.FC} Returns GroupListItem component
 */
const GroupListItem: React.FC<IGroupListItemProps> = React.memo(
  ({ chat, onGroupSelect, isActive }) => {
    const currentUser = useSelector((state: RootState) => {
      return state.auth.user;
    });

    if (!chat || !currentUser) return null;

    const unreadCount = chat.unreadCount?.[currentUser._id] || ZERO;
    const lastMessage = chat.messages?.[chat.messages.length - ONE]?.text;
    const memberCount = chat.participants.length;

    return (
      <div
        className={`flex items-center gap-3 p-2 my-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200 ${
          isActive ? 'bg-gray-100 rounded-lg' : ''
        }`}
        onClick={() => {
          return onGroupSelect?.(chat._id);
        }}>
        <Badge offset={[ONE, THREE]} color="green" count={unreadCount}>
          <Avatar
            size="large"
            src={chat.avatar}
            className="text-green-700 border-2 border-[#25D366] font-bold text-2xl"
            style={{ backgroundColor: '#CEF6DB' }}>
            {!chat.avatar && (chat.name?.charAt(ZERO).toUpperCase() || <UserOutlined />)}
          </Avatar>
        </Badge>
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-medium">{chat.name}</span>
            <span className="text-xs text-gray-500">{memberCount} members</span>
          </div>
          {lastMessage && <p className="text-sm text-gray-500 truncate mt-1">{lastMessage}</p>}
        </div>
      </div>
    );
  }
);

GroupListItem.displayName = 'GroupListItem';

export default GroupListItem;

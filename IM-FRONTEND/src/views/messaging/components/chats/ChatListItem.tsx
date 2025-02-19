/* eslint-disable react/prop-types */
/* eslint-disable no-magic-numbers */
import React from 'react';
import { Badge } from 'antd';
import { THREE, ZERO } from 'constant';
import { IChatListItemProps } from '../types';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from 'appRedux/store';
import OnlineStatusAvatar from 'components/common/OnlineStatusAvatar';

/**
 * ChatListItem
 * @param {IChatListItemProps} props - props
 * @returns {React.FC} - returns
 */
const ChatListItem: React.FC<IChatListItemProps> = React.memo(
  ({ chat, onChatSelect, isActive }) => {
    // const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => {
      return state.auth.user;
    });

    if (!chat || !currentUser) return null;

    const otherParticipant = chat.participants?.find((p) => {
      return p._id !== currentUser._id;
    });
    const unreadCount = chat.unreadCount?.[currentUser._id] || 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const lastMessage = chat.messages?.[chat.messages.length - 1]?.text;

    return (
      <div
        className={`flex items-center gap-3 p-2 my-1 hover:bg-gray-100 hover:rounded-lg cursor-pointer transition-colors duration-200 ${
          isActive ? 'bg-gray-100 rounded-lg' : ''
        }`}
        onClick={() => {
          return onChatSelect?.(chat._id);
        }}>
        {unreadCount > 0 ? (
          <Badge offset={[ZERO, THREE]} color="green" count={unreadCount}>
            <div className="p-0.5 rounded-full border-2 border-[#25D366]">
              <OnlineStatusAvatar
                userId={otherParticipant?._id || ''}
                avatarProps={{
                  size: 'large',
                  style: { backgroundColor: '#CEF6DB' },
                  icon: <UserOutlined />
                }}
              />
            </div>
          </Badge>
        ) : (
          <OnlineStatusAvatar
            userId={otherParticipant?._id || ''}
            avatarProps={{
              size: 'large',
              className: 'border-2 border-[#25D366]',
              style: { backgroundColor: '#CEF6DB' },
              icon: <UserOutlined />
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <span className="font-medium block truncate">{otherParticipant?.username}</span>
          {lastMessage && (
            <p className="text-sm text-gray-500 mt-1 truncate max-w-full overflow-hidden text-ellipsis">
              {lastMessage}
            </p>
          )}
        </div>
      </div>
    );
  }
);

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem;

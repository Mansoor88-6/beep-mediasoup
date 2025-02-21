import React from 'react';
import { useSelector } from 'react-redux';
import { OnlineUsersSelector } from 'appRedux/reducers/onlineUsersReducer';
import { Avatar, Badge } from 'antd';
import { css } from '@emotion/css';

/**
 * Generates the badge style based on the online status
 * @param {boolean} isOnline - Whether the user is online
 * @returns {string} The CSS class string
 */
const badgeStyle = (isOnline: boolean) => {
  return css`
    position: relative;
    display: inline-block;

    .ant-badge-dot {
      background: ${isOnline ? '#44b700' : '#808080'};
      box-shadow: 0 0 0 2px #fff;
      width: 8px;
      height: 8px;
      top: auto !important;
      bottom: 2px !important;
      right: 2px !important;
      transform: none !important;
      border-radius: 50%;

      &::after {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        animation: ripple 1.2s infinite ease-in-out;
        border: 1px solid ${isOnline ? '#44b700' : '#808080'};
        content: '';
      }
    }

    @keyframes ripple {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(2.4);
        opacity: 0;
      }
    }
  `;
};

interface OnlineStatusAvatarProps {
  userId: string;
  avatarProps?: React.ComponentProps<typeof Avatar>;
}

/**
 * OnlineStatusAvatar component
 * @param {OnlineStatusAvatarProps} props - The component props
 * @returns {React.ReactElement} The component
 */
const OnlineStatusAvatar: React.FC<OnlineStatusAvatarProps> = ({ userId, avatarProps }) => {
  const onlineUsers = useSelector(OnlineUsersSelector);
  const isOnline = onlineUsers.includes(userId);

  return (
    <Badge dot={true} className={badgeStyle(isOnline)}>
      <Avatar {...avatarProps} />
    </Badge>
  );
};

export default OnlineStatusAvatar;

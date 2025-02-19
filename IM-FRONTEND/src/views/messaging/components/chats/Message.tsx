import React, { useState } from 'react';
import { Typography, Modal, Avatar } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { IMessageProps, IReaction, IParticipant } from '../types';
import { CheckOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { AuthSelector } from 'appRedux/reducers';
import MessageReactions from './MessageReactions';
import { useAppDispatch } from 'appRedux/store';
import { sendMessageReaction, removeMessageReaction } from 'appRedux/actions/messageAction';

const { Text } = Typography;

/**
 * Message component for displaying chat messages
 * @param {IMessageProps} props - Component props
 * @returns {React.FC} Returns Message component
 */
const Message: React.FC<IMessageProps & { isGroup?: boolean; sender?: IParticipant }> = ({
  _id,
  text,
  timestamp,
  received = false,
  seenBy = [],
  isSent = false,
  reactions = [],
  isGroup = false,
  sender
}) => {
  const dispatch = useAppDispatch();
  const { user } = useSelector(AuthSelector);
  const [isReactionsModalVisible, setIsReactionsModalVisible] = useState(false);

  /**
   * Handles adding a reaction to a message
   * @param {string} emoji - The emoji to add as a reaction
   */
  const handleReact = async (emoji: string) => {
    if (!user || !_id) return;
    try {
      await dispatch(
        sendMessageReaction({
          messageId: _id,
          emoji: emoji
        })
      ).unwrap();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  /**
   * Handles removing a reaction from a message
   * @param {string} emoji - The emoji to remove from reactions
   */
  const handleRemoveReaction = async (emoji: string) => {
    if (!user || !_id) return;
    try {
      await dispatch(
        removeMessageReaction({
          messageId: _id,
          emoji: emoji
        })
      ).unwrap();
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  // Group reactions by emoji
  const groupedReactions = React.useMemo(() => {
    // Ensure reactions is an array and handle undefined/null cases
    const reactionArray: IReaction[] = Array.isArray(reactions) ? reactions : [];

    return reactionArray.reduce((acc: { [key: string]: IReaction[] }, reaction: IReaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {});
  }, [reactions]);

  return (
    <div className={`flex ${received ? 'justify-start' : 'justify-end'} mb-4 px-4 group relative`}>
      {isGroup && received && (
        <div className="flex-shrink-0 mr-2 mt-1">
          <Avatar
            size={28}
            src={sender?.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#CEF6DB' }}
          />
        </div>
      )}
      <div className="relative max-w-[65%]">
        {isGroup && received && (
          <span className="text-xs font-medium text-green-600 mb-0.5 ml-1">{sender?.username}</span>
        )}
        {/* Message bubble */}
        <div
          className={`relative ${
            received ? 'bg-white' : 'bg-[#E3F7ED]'
          } rounded-lg px-4 py-2 shadow-sm`}>
          <Text>{text}</Text>
          <div className="flex items-center justify-end gap-1 mt-1">
            <Text className="text-xs text-gray-500">
              {timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : ''}
            </Text>
            {!received && (
              <div className="flex items-center">
                {isSent ? (
                  <>
                    <CheckOutlined
                      className={`${seenBy.length > 0 ? 'text-blue-500' : 'text-gray-400'}`}
                    />
                    <CheckOutlined
                      className={`-ml-[8px] ${
                        seenBy.length > 0 ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                  </>
                ) : (
                  <CheckOutlined className="text-gray-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reaction buttons (shown on hover) */}
        <div
          className={`absolute ${
            received ? 'right-0 translate-x-[105%]' : 'left-0 -translate-x-[105%]'
          } top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-20`}>
          {user && (
            <MessageReactions
              reactions={Array.isArray(reactions) ? reactions : []}
              onReact={handleReact}
              onRemoveReaction={handleRemoveReaction}
              currentUserId={user._id}
            />
          )}
        </div>

        {/* Reactions display */}
        {Array.isArray(reactions) && reactions.length > 0 && (
          <div
            className={`absolute ${
              received ? '-right-2' : '-left-2'
            } -bottom-2 bg-white rounded-full shadow-sm border border-gray-100 px-1.5 py-0.5 
              flex items-center gap-0.5 text-xs z-10 hover:shadow-md transition-shadow duration-200 cursor-pointer`}
            onClick={() => {
              return setIsReactionsModalVisible(true);
            }}>
            {Object.entries(groupedReactions).map(([emoji, reactors]) => {
              const hasReacted = reactors.some((r) => {
                return r.userId === user?._id;
              });
              return (
                <span
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasReacted) {
                      handleRemoveReaction(emoji);
                    } else {
                      handleReact(emoji);
                    }
                  }}
                  className={`px-0.5 rounded transition-all duration-200 hover:scale-125 ${
                    hasReacted ? 'text-green-600' : ''
                  }`}>
                  {emoji}
                </span>
              );
            })}
            <span className="text-gray-400 text-[10px] ml-0.5 min-w-[14px] text-center">
              {reactions.length}
            </span>
          </div>
        )}

        {/* Reactions Modal */}
        <Modal
          title={
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-lg font-medium">Message Reactions</span>
              <div className="flex gap-2">
                {Object.entries(groupedReactions).map(([emoji, reactors]) => {
                  return (
                    <div
                      key={emoji}
                      className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full">
                      <span className="text-base">{emoji}</span>
                      <span className="text-sm text-gray-600 font-medium">{reactors.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          }
          open={isReactionsModalVisible}
          onCancel={() => {
            setIsReactionsModalVisible(false);
          }}
          footer={null}
          width={400}
          className="reactions-modal">
          <div className="flex flex-col gap-4 mt-4">
            {/* List of users who reacted */}
            {Object.entries(groupedReactions).map(([emoji, reactors]) => {
              return (
                <div key={emoji} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm text-gray-600">
                      {reactors.length} {reactors.length === 1 ? 'reaction' : 'reactions'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {reactors.map((reactor) => {
                      return (
                        <div key={reactor.userId} className="flex items-center gap-2 py-1">
                          <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            className="bg-[#E3F7ED] text-green-600"
                          />
                          <span className="text-sm font-medium">{reactor.username}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {formatDistanceToNow(new Date(reactor.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>

        <style>
          {`
            .reactions-modal .ant-modal-content {
              border-radius: 12px;
              overflow: hidden;
            }
            .reactions-modal .ant-modal-header {
              border-bottom: none;
              padding-bottom: 0;
            }
            .reactions-modal .ant-modal-body {
              padding: 20px;
            }
            .reactions-modal .ant-modal-close {
              top: 16px;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Message;

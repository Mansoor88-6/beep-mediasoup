import React from 'react';
import { Popover, Button } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { IReaction } from '../types';

// Common emoji options for quick reactions
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface MessageReactionsProps {
  reactions: IReaction[];
  onReact: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  currentUserId: string;
}

/**
 * Component for displaying and managing message reactions
 * @param root0
 * @param root0.reactions
 * @param root0.onReact
 * @param root0.onRemoveReaction
 * @param root0.currentUserId
 */
const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onReact,
  onRemoveReaction,
  currentUserId
}) => {
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

  /**
   * Renders the emoji picker popover content
   * @returns {React.ReactNode} The emoji picker UI
   */
  const renderEmojiPicker = () => {
    return (
      <div className="p-2 bg-white rounded-lg shadow-lg">
        <div className="flex gap-1.5 flex-wrap max-w-[200px]">
          {QUICK_REACTIONS.map((emoji) => {
            const hasReacted = Object.entries(groupedReactions).some(([e, reactors]) => {
              return (
                e === emoji &&
                reactors.some((r) => {
                  return r.userId === currentUserId;
                })
              );
            });

            return (
              <Button
                key={emoji}
                type="text"
                className={`flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full 
                  transition-all duration-200 hover:scale-110 ${
                    hasReacted ? 'bg-green-50 text-green-600 hover:bg-green-100' : ''
                  }`}
                onClick={() => {
                  if (hasReacted) {
                    onRemoveReaction(emoji);
                  } else {
                    onReact(emoji);
                  }
                }}>
                {emoji}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center">
      <Popover
        content={renderEmojiPicker()}
        trigger="click"
        placement="top"
        overlayClassName="reactions-popover"
        mouseEnterDelay={0.3}
        mouseLeaveDelay={0.3}>
        <Button
          size="small"
          type="text"
          className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 
            transition-all duration-200 hover:scale-110 text-gray-500 hover:text-gray-700 bg-white shadow-sm"
          icon={<SmileOutlined />}
        />
      </Popover>

      <style>
        {`
          .reactions-popover .ant-popover-inner {
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
          }
          .reactions-popover .ant-popover-inner-content {
            padding: 0;
          }
          .reactions-popover .ant-popover-arrow {
            display: none;
          }
          @keyframes scaleIn {
            from {
              transform: scale(0.8);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .reactions-popover {
            animation: scaleIn 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default MessageReactions;

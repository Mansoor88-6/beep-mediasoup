import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'appRedux/store';
import { emitTypingStatus } from 'appRedux/middleware/socket/socketMiddleware';
import debounce from 'lodash/debounce';

export const useTypingStatus = (chatId: string) => {
  // Get typing users for this chat
  const typingUsers = useSelector(
    (state: RootState) =>
      state.typing[chatId]?.filter((user) => user.userId !== state.auth.user?._id) || []
  );

  // Create debounced emit function
  const debouncedEmitTyping = useCallback(
    debounce((isTyping: boolean) => {
      emitTypingStatus(chatId, isTyping);
    }, 300),
    [chatId]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedEmitTyping.cancel();
    };
  }, [debouncedEmitTyping]);

  const handleTyping = () => {
    debouncedEmitTyping(true);
  };

  // Format typing status message
  const typingStatusMessage = useCallback(() => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    return 'Several people are typing...';
  }, [typingUsers]);

  return {
    handleTyping,
    typingStatusMessage: typingStatusMessage(),
    isAnyoneTyping: typingUsers.length > 0
  };
};

export default useTypingStatus;

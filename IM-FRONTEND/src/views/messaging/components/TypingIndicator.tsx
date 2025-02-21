import React from 'react';
import { useTypingStatus } from 'hooks/useTypingStatus';

interface TypingIndicatorProps {
  chatId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ chatId }) => {
  const { typingStatusMessage, isAnyoneTyping } = useTypingStatus(chatId);

  if (!isAnyoneTyping) return null;

  return (
    <div className="text-sm text-gray-600 italic bg-white/80 rounded-lg w-fit max-w-[80%] px-3 py-1.5 shadow-sm">
      {typingStatusMessage}
      <span className="typing-animation">...</span>
    </div>
  );
};

export default TypingIndicator;

import React from 'react';
import { IMessageProps } from '../types';
// import { CheckSvg } from 'assets/svgs';

/**
 * Message
 * @param {IMessageProps} props - props
 * @returns {React.FC} - returns
 */
const Message: React.FC<IMessageProps> = (props: IMessageProps) => {
  const { received, text } = props;
  return (
    <div className={`flex ${received ? '' : 'justify-end'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 flex flex-col ${
          received ? 'bg-[#FFFFFF]' : 'bg-[#E3F7ED]'
        }`}>
        <p className="text-sm">{text}</p>
        <div className="flex justify-between items-center">
          <span className={`text-xs text-gray-500 ${received ? '' : 'ml-auto'}`}>{''}</span>
          <div className="flex items-center space-x-1">
            {/* {isSent && !isSeen && <CheckSvg className="text-gray-500 text-xs" />}
            {isSeen && <CheckSvg className="text-gray-500 text-xs" />} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;

import React from 'react';
import { Dropdown, Input, MenuProps, Space } from 'antd';
import { ChevronRight, Send, Smile, Users } from 'lucide-react';

/**
 * Chats
 * @returns {React.FC} - return
 */
const Chats = () => {
  const items: MenuProps['items'] = [
    {
      label: 'Everyone',
      key: '1'
    }
  ];
  const menuProps = {
    items: items,
    onClick: () => {}
  };
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
          <Send className="w-8 h-8" />
          <p>Start a conversation</p>
          <p className="text-sm text-center">
            There are no messages here yet. Start a conversation by sending a message.
          </p>
        </div>
      </div>
      <div className="flex gap-x-2 mb-2 items-center">
        <label htmlFor="">To</label>
        <Dropdown className="border-none rounded-md px-2 bg-[#DBEED9]" menu={menuProps}>
          <a
            className="flex gap-2 items-center"
            onClick={(e) => {
              return e.preventDefault();
            }}>
            <Users size={15} />
            <Space>
              Everyone
              <ChevronRight size={15} />
            </Space>
          </a>
        </Dropdown>
      </div>
      <div className="py-2 border-t">
        <Input
          placeholder="Send a message..."
          className="bg-[#ffffff] border-none focus:border-none focus:outline-none focus:ring-0 p-2 mb-2"
          suffix={
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-gray-400" />
              <Send className="w-4 h-4 text-gray-400" />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Chats;

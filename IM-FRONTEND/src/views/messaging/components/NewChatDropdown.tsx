/* eslint-disable no-magic-numbers */
import React from 'react';
import { Menu, Avatar, Divider } from 'antd';
import { UsergroupAddOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from 'appRedux/store';
import OnlineStatusAvatar from 'components/common/OnlineStatusAvatar';

interface NewChatDropdownProps {
  setGroupModalVisible: (value: boolean) => void;
  onUserSelect: (userId: string) => void;
}

/**
 * @param {NewChatDropdownProps} onUserSelect - The function to call when a user is selected.
 * @returns {React.FC} - The NewChatDropdown component.
 */
const NewChatDropdown: React.FC<NewChatDropdownProps> = ({
  onUserSelect,
  setGroupModalVisible
}) => {
  const availableParticipants = useSelector((state: RootState) => {
    return state.messages.availableParticipants;
  });

  const items = [
    // {
    //   name: 'add-user',
    //   icon: <UserAddOutlined />,
    //   placeholder: 'New chat',
    //   onCreate: () => {}
    // },
    {
      name: 'create-group',
      icon: <UsergroupAddOutlined />,
      placeholder: 'New group',
      onCreate: () => {
        return setGroupModalVisible(true);
      }
    }
  ];

  return (
    <Menu className="w-[255px] h-[320px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {items.map((item, idx) => {
        return (
          <div
            key={idx}
            onClick={item.onCreate}
            className="flex items-baseline gap-2 px-1 my-1 cursor-pointer p-1 rounded-md hover:bg-gray-100">
            <Avatar icon={item.icon} className="bg-green-500" />
            <div className="flex flex-col w-auto">
              <span className="font-medium">{item.placeholder}</span>
            </div>
          </div>
        );
      })}
      <Divider className="p-0 m-0 my-1" />
      {availableParticipants.map((user) => {
        return (
          <Menu.Item
            key={user._id}
            onClick={() => {
              return onUserSelect(user._id);
            }}
            className="hover:bg-gray-100">
            <div className="flex gap-2 my-1">
              <OnlineStatusAvatar
                userId={user._id}
                avatarProps={{
                  size: 'large',
                  src: user.avatar,
                  icon: !user.avatar && <UserOutlined />,
                  className: 'border-2 border-[#25D366]'
                }}
              />
              <div className="flex flex-col w-auto">
                <span className="font-medium">{user.username}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </div>
          </Menu.Item>
        );
      })}
      {availableParticipants.length === 0 && (
        <Menu.Item disabled className="text-center text-gray-500">
          No users available
        </Menu.Item>
      )}
    </Menu>
  );
};

export default NewChatDropdown;

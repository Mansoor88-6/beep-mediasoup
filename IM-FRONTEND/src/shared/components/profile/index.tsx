import React from 'react';
import { Avatar, Divider, Dropdown, Menu, Tooltip } from 'antd';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
// Others
import { ZERO } from 'constant';
import { IProfileProps } from './types';
// Redux
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'appRedux/store';
import { AuthSelector } from 'appRedux/reducers';
import { logout } from 'appRedux/actions/authAction';

/**
 * Render Profile Menu
 * @param {IProfileProps} props - prm
 * @returns {React.FC} - returns
 */
const ProfileNav: React.FC<IProfileProps> = (props: IProfileProps) => {
  const { flex, ...rest } = props;
  const dispatch = useAppDispatch();
  const { user } = useSelector(AuthSelector);

  const menu = (
    <Menu className="bg-white w-[200px] border border-gray-200 shadow-lg rounded-lg">
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        className="text-sm text-gray-700 hover:bg-gray-100">
        Profile
      </Menu.Item>
      <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        className="text-sm text-gray-700 hover:bg-gray-100">
        Settings
      </Menu.Item>
      <Divider className="my-2" />
      <Menu.Item
        key="logout"
        onClick={async () => {
          await dispatch(logout());
        }}
        icon={<LogoutOutlined />}
        className="text-sm text-gray-700 hover:bg-gray-100">
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} className="text-center">
      <Tooltip className="cursor-pointer" placement="right" title={user?.username}>
        <div
          className={
            flex ? 'flex flex-row-reverse items-center justify-center gap-1' : 'flex-col my-1'
          }>
          <div className={`rounded-full ${flex ? 'border-green-400' : 'border-white'}`}>
            <Avatar
              size={32}
              {...rest}
              style={{ color: 'green', fontWeight: 'bold', backgroundColor: '#e0f8d9' }}>
              {user?.username.charAt(ZERO).toUpperCase()}
            </Avatar>
          </div>
          {/* <span className="mt-1 text-gray-700 rounded-lg font-semibold capitalize truncate">
            {user?.username.slice(ZERO, SIX)}
          </span> */}
        </div>
      </Tooltip>
    </Dropdown>
  );
};

export default ProfileNav;

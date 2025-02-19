import React from 'react';
import { Layout, Dropdown, Avatar, Menu } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { logout } from 'appRedux/actions/authAction';
import { useSelector } from 'react-redux';
import { AuthSelector } from 'appRedux/reducers';
import { useAppDispatch } from 'appRedux/store';
const { Header, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout Component
 *
 * @param {React.ReactNode} children - The child components to be rendered inside the layout
 * @returns {React.FC}
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useSelector(AuthSelector);

  const profileMenu = (
    <Menu>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={async () => {
          await dispatch(logout());
        }}
        className="hover:bg-gray-100">
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-4 flex items-center justify-between">
        <div className="text-xl text-green-700 font-semibold">Beep Board</div>
        <Dropdown overlay={profileMenu} trigger={['hover']} placement="bottomRight">
          <div className="cursor-pointer flex items-center space-x-2">
            <Avatar icon={<UserOutlined />} className="bg-green-500" />
            <span className="text-bold text-gray-700">{user?.username}</span>
          </div>
        </Dropdown>
      </Header>
      <Content className="p-6">{children}</Content>
    </Layout>
  );
};

export default AdminLayout;

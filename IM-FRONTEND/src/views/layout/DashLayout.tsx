import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, MessageOutlined, DashboardOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { ProfileNav } from 'shared';

const { Header, Sider, Content } = Layout;

/**
 * DashLayout - Main dashboard layout component with Ant Design
 * @returns {React.FC} Dashboard layout component
 */
const DashLayout: React.FC = () => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: 'Messages'
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile'
    }
  ];

  return (
    <Layout className="min-h-screen">
      <Sider style={{ backgroundColor: '#40916c' }} className="bg-white">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl text-white font-bold">B33P AVEROX</h1>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-6 flex items-center justify-between border-b">
          <h2 className="text-lg font-semibold">Welcome Back</h2>

          <ProfileNav size={'large'} />
        </Header>
        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashLayout;

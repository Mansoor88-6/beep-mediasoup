import React from 'react';
import { useSelector } from 'react-redux';
import { Layout } from 'antd';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader } from 'components';
import { AuthSelector } from 'appRedux/reducers';
import { UserRoles } from 'types';

const { Content } = Layout;

interface IAuthParams {
  children: React.ReactElement;
}

/**
 * Checks for user authentication and redirects to login
 * @param {IAuthParams} params - children params for Require Auth
 * @returns {React.FC} returns children or redirect to login based on isAuthenticated
 */
const RequireAuth = ({ children }: IAuthParams) => {
  const { user, loading, role } = useSelector(AuthSelector);
  const location = useLocation();

  if (loading) {
    return (
      <Content className="auth-loading">
        <Loader spinning={true} size={'large'} />
      </Content>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Handle role-based routing
  const currentPath = location.pathname;

  if (role === UserRoles.Client && !currentPath.startsWith('/im')) {
    return <Navigate to="/im" replace />;
  }

  if (role === UserRoles.Admin && !currentPath.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default RequireAuth;

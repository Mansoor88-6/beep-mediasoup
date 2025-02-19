import React from 'react';
import { useSelector } from 'react-redux';
import { Layout } from 'antd';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader } from 'components';
import { AuthSelector } from 'appRedux/reducers';

const { Content } = Layout;

interface IAuthParams {
  children: React.ReactElement;
}

/**
 * Checks for user authentication and redirects to login
 * @param {IAuthParams} params - children params for Reuqire Auth
 * @returns {React.FC} returns children or redirect to login based on isAuthenticated
 */
const RequireAuth = ({ children }: IAuthParams) => {
  const { isAuthenticated, loading } = useSelector(AuthSelector);
  const location = useLocation();

  return loading ? (
    <Content className="auth-loading">
      <Loader spinning={true} size={'large'} />
    </Content>
  ) : isAuthenticated ? (
    children
  ) : (
    <Navigate to="/" replace state={location.pathname} />
  );
};

export default RequireAuth;

import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
// import { TwitterSquareFilled, LinkedinFilled } from '@ant-design/icons';

import { UserRoles } from 'types';
import { SignIn, SignUp } from 'views';
import Loader from 'components/Loader';
// import BeepLogo from 'assets/imgs/beep.png';
import NotFoundLayout from 'views/notFound/NotFound';

import { useSelector } from 'react-redux';
import { useAppDispatch } from 'appRedux/store';
import { AuthSelector } from 'appRedux/reducers';
import { loadUser } from 'appRedux/actions/authAction';

// const { useBreakpoint } = Grid;

/**
 * This is a Auth Layout
 * @returns {React.FC} Auth Layout
 */
const AuthLayout: React.FC = () => {
  // const { Text, Title } = Typography;
  // const screens = useBreakpoint();
  // const mdOrUp = Boolean(screens.md);
  const signUp = '/signup';
  const dispatch = useAppDispatch();

  // Route protection redirection
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, loading, recentLoggedOut } = useSelector(AuthSelector);

  useEffect(() => {
    if (recentLoggedOut) {
      dispatch(loadUser());
    }
  }, [recentLoggedOut]);

  useEffect(() => {
    (async () => {
      if (isAuthenticated && role) {
        const cachedPath = location.state as string;
        if (role === UserRoles.Client || role === UserRoles.SubClient) {
          if (cachedPath && Array.isArray(cachedPath) && cachedPath?.includes('user')) {
            // If not redirect to cached state
            navigate((location.state as string) || '/user');
          }
        }
        if (role === UserRoles.Admin) {
          if (cachedPath && Array.isArray(cachedPath) && cachedPath?.includes('admin')) {
            navigate((location.state as string) || '/admin');
          }
        }
        navigate(
          role === UserRoles.Admin
            ? '/admin'
            : role === UserRoles.Client || role === UserRoles.SubClient
            ? '/user/'
            : '/'
        );
      }
      // Run it only once
    })();
  }, [isAuthenticated, role, loading]);

  return recentLoggedOut || loading || isAuthenticated ? (
    <section className="h-screen flex justify-center items-center">
      <Loader spinning={true} size={'large'} className="text-white" />
    </section>
  ) : (
    // <Row>
    //   <Col
    //     hidden={!mdOrUp}
    //     xs={0}
    //     md={7}
    //     className="hidden  lg:flex bg-green-700 rounded-e-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-5 flex flex-col justify-between p-4 border-r">
    //     <div>
    //       <Image width={200} src={BeepLogo} preview={false} />
    //     </div>

    //     <div>
    //       <Title level={2}>
    //         <span className="text-white">{signUp ? 'Create an Account!' : 'Welcome Back!'}</span>
    //       </Title>

    //       <a className="text-white" href={`${signUp ? '/signup' : '/signin'}`}>
    //         {signUp ? 'Sign Up' : 'Sign In'}
    //       </a>
    //       <br />

    //       <Text className="text-white">Connect, Communicate, Capture.</Text>
    //     </div>

    //     <div>
    //       <Text className="text-white">contact@averox.com</Text>
    //       <div className="mt-2">
    //         <a href="https://averox.com" target="_blank" rel="noreferrer" className="mr-4">
    //           <TwitterSquareFilled style={{ fontSize: '24px', color: '#1DA1F2' }} />
    //         </a>
    //         <a href="/" target="_blank" rel="noreferrer">
    //           <LinkedinFilled style={{ fontSize: '24px', color: '#0077B5' }} />
    //         </a>
    //       </div>
    //       <div className="mt-2 text-white">
    //         <a href="/privacy-policy" target="_blank" rel="noreferrer">
    //           Privacy Policy
    //         </a>
    //         <Text className="ml-4 text-white">All Rights Reserved</Text>
    //       </div>
    //     </div>
    //   </Col>

    //   <Col xs={24} md={16} className="">
    //     <Row justify="center" align="middle">
    //       <Col span={24}>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path={`${signUp}`} element={<SignUp />} />
      <Route path="*" element={<NotFoundLayout />} />
    </Routes>
    //       </Col>
    //     </Row>
    //   </Col>
    // </Row>
  );
};

export default AuthLayout;

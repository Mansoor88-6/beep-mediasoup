import React, { useEffect } from 'react';
import './App.css';
import '@fontsource/chakra-petch';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// redux
import store from 'appRedux/store';
import { Provider } from 'react-redux';
import { loadUser } from 'appRedux/actions/authAction';

// Other
import { Alert } from 'components';
import RequireAuth from 'utils/RequireAuth';
import {
  OnBoard,
  Messaging,
  Calling,
  Meeting,
  AuthLayout,
  UserManagement,
  AdminLayout
} from './views';

// middleware
/**
 *
 * @returns {React.FC} - app
 */
const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <ConfigProvider>
        <BrowserRouter>
          <div className="App">
            <Alert />
            <Routes>
              <Route path="*" element={<AuthLayout />} />

              {/* Users Management Route */}
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout>
                      <UserManagement />
                    </AdminLayout>
                  </RequireAuth>
                }
              />
              {/* Onboarding Route */}
              <Route
                path="/user"
                element={
                  <RequireAuth>
                    <OnBoard />
                  </RequireAuth>
                }
              />

              {/* Protected Routes after Onboarding */}
              <Route
                path="/im"
                element={
                  <RequireAuth>
                    <Messaging />
                  </RequireAuth>
                }
              />
              <Route
                path="/vc"
                element={
                  <RequireAuth>
                    <Meeting />
                  </RequireAuth>
                }
              />
              <Route
                path="/vc/:roomId"
                element={
                  <RequireAuth>
                    <Calling />
                  </RequireAuth>
                }
              />
              {/* <Route path="recovery" element={<PasswordRecoveryLayout />}>
                <Route index element={<ForgetPassword />} />
                <Route path="reset-password/:token" element={<PasswordReset />} />
              </Route> */}
            </Routes>
          </div>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
};

export default App;

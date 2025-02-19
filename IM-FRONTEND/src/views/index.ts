// auth
import SignIn from './auth/Signin';
import SignUp from './auth/Signup';
import OnBoard from './onBoard/OnBoard';
import Messaging from './messaging';
import Meeting from './meeting';
import UserManagement from './users/admin';
// Layouts
import AuthLayout from './layout/AuthLayout';
import AdminLayout from './layout/AdminLayout';

export {
  // Layout
  AuthLayout,
  AdminLayout,

  // Auth
  SignIn,
  SignUp,

  // Others
  OnBoard,
  Messaging,
  Meeting,
  UserManagement
};

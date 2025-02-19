import { UserRoles } from 'types';
import { IUser } from './index';

export interface AuthState {
  token?: string | null;
  isAuthenticated?: boolean | null;
  isRegistered?: boolean | null;
  loading?: boolean;
  user?: IUser | null;
  role?: UserRoles | null;
  invalidToken?: boolean | null;
  recentLoggedOut?: boolean;
}

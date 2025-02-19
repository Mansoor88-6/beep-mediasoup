import { UserRoles } from 'types';
export interface IUserApiKey {
  _id: string;
  name: string;
  key: string;
  updatedAt: string;
  createdAt: string;
}

export interface IUser {
  username: string;
  email: string;
  role: UserRoles;
  avatar?: string;
  activate: boolean;
  _id: string;
  date: string;
  // address: string;
  // organization: string;
  created_by?: string;
  last_password_change: Date;
}

export interface IUserUpdateData {
  activate?: boolean;
  address?: string;
  email?: string;
  username?: string;
  _id?: string;
  organization?: string;
  role?: string;
}

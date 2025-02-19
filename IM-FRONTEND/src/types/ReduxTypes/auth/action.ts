// Auth action types

import { UploadChangeParam } from 'antd/lib/upload/interface';

export interface ILoginFormData {
  email: string;
  password: string;
}

export interface IConfirmPasswordData {
  password: string;
}

export interface ILoginResponseData {
  role?: string;
  id?: string;
}

export interface IRegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  token?: string;
}

export interface IChangePasswordProps {
  oldPassword: string;
  newPassword: string;
  clientId?: string;
}

export interface IForgotPasswordProps {
  user: {
    email: string;
  };
}

export interface IResetPasswordProps {
  password: string;
  token: string;
}

export interface IValidTokenProps {
  token: string;
}

export interface IUserProfileProps {
  username: string;
  address: string;
}

export interface IUserAvatarProps {
  avatar: UploadChangeParam;
}

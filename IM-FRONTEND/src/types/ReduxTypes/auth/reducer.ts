import { IUser } from '../user/index';

export interface IUserAavatar {
  avatar: string;
}

export interface IApiKeyProps {
  userId: string;
  keyName: string;
}

export type { IUser };

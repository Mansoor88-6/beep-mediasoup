import { IUser } from './reducer';

export interface ITotalObj {
  total: number;
}

export interface IUserObj {
  data: Array<IUser>;
  totalDocuments: Array<ITotalObj>;
}

export interface UserState {
  users: IUser[];
  usersLoading: boolean;
}

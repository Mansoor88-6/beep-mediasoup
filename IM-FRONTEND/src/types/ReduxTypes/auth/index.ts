// state
export * from './state';

// reducer
export * from './reducer';

// action
export * from './action';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
}

export interface IUserAddFormActionData {
  username: string;
  address: string;
  organization: string;
  email: string;
}

export interface IUserEditFormActionData {
  _id: string;
  username: string;
  address: string;
  organization: string;
  email: string;
  activate: boolean;
}

export interface IChangePasswordFormActionData {
  newPassword: string;
  confirmPassword: string;
  clientId: string;
}

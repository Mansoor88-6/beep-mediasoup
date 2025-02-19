import { FormInstance } from 'antd';
import { IUser } from 'types/ReduxTypes/user';

export interface IUserModalProps {
  editMode: boolean;
  handleClose?: () => void;
  modalVisibility: boolean;
  dataSet: IUser | null | undefined;
  setModalVisibility: (visibility: boolean) => void;
  setDataSet: React.Dispatch<React.SetStateAction<IUser | null | undefined>>;
}
export interface IChangePasswordProps {
  form: FormInstance;
  editMode: boolean;
  handleClose: () => void;
  dataSet: IUser | null | undefined;
}
export interface IUserInfoProps extends IChangePasswordProps {}

export interface IChangePasswordFormData {
  newPassword: string;
  confirmPassword: string;
  clientId: string;
}

export interface ICreateUserFormData {
  _id?: string;
  username: string;
  email: string;
  password: string;
  role: string;
  activate: boolean;
  confirmPassword: string;
}

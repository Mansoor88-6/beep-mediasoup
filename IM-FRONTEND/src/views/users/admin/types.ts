import { IUser } from 'types/ReduxTypes/user';

export interface IUserModalProps {
  modalVisibility: boolean;
  setModalVisibility: (visibility: boolean) => void;
  dataSet: IUser | null | undefined;
  editMode: boolean;
  setDataSet: React.Dispatch<React.SetStateAction<IUser | null | undefined>>;
}

export interface IChangePasswordFormData {
  newPassword: string;
  confirmPassword: string;
  clientId: string;
}

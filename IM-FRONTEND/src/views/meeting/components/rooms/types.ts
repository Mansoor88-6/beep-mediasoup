import { IRoom } from 'types/ReduxTypes/room';

export interface IRoomCardProps extends IRoom {
  date: string;
  time: string;
  icon?: string;
  color: string;
  onEditButton: () => void;
}

export interface IRoomModalProps {
  edit: boolean;
  dataSet: IRoom | null | undefined;
  modalVisibility: boolean;
  setDataSet: (value: IRoom | null) => void;
  setModalVisibility: (value: boolean) => void;
}

import { IRoom } from './reducer';

export interface RoomState {
  rooms: IRoom[] | null;
  roomsLoading: boolean;
}

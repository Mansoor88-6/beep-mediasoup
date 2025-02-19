export interface IRoom {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  roomCode: string;
  hostname: string;
  createdBy: string;
  isPrivate: boolean;
  lastSession: string;
  participants: number;
  joinParticipants: number;
}

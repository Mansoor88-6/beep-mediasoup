export interface IParticipant {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isPinned?: boolean;
}

export interface IParticipantProps {
  participants: IParticipant[];
}

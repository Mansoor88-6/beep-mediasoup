import { RefObject } from 'react';

export interface ICallCardProps {
  remoteUsername: string | null;
  userId: string | null;
  isOngoing: boolean;
  isMuted: boolean;
  isVideo: boolean;
  isVideoEnabled: boolean;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
}

/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video'
}

export enum CallStatus {
  MISSED = 'missed',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  UNANSWERED = 'unanswered',
  ACCEPTED = 'accepted',
  BUSY = 'busy',
  LEFT = 'left'
}

export enum CallState {
  ONGOING = 'ongoing',
  ENDED = 'ended'
}

export interface ICallParticipant {
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  role: 'initiator' | 'receiver';
  status: CallStatus;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export interface ICallLog {
  _id: string;
  chatId: string;
  callType: CallType;
  state: CallState;
  participants: ICallParticipant[];
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  quality?: {
    avgBitrate?: number;
    packetLoss?: number;
    latency?: number;
  };
  recordingUrl?: string;
  metadata?: {
    deviceInfo?: {
      browser?: string;
      os?: string;
      device?: string;
    };
    networkType?: string;
    callEndReason?: string;
    retryCount?: number;
    isReconnected?: boolean;
  };
  failureReason?: string; // For failed calls (missed, rejected, etc.)
  reconnectionAttempts?: number;
  lastActiveTime?: Date; // Last time any participant was active
}

export interface CallLogsState {
  logs: ICallLog[];
  chatLogs: { [chatId: string]: ICallLog[] };
  loading: boolean;
  error: string | null;
}

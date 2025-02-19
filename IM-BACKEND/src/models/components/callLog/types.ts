import { Document } from "mongoose";

export enum CallType {
  AUDIO = "audio",
  VIDEO = "video",
}

export enum CallStatus {
  MISSED = "missed",
  COMPLETED = "completed",
  REJECTED = "rejected",
  UNANSWERED = "unanswered",
  ACCEPTED = "accepted",
  BUSY = "busy",
  LEFT = "left",
}

export enum CallState {
  ONGOING = "ongoing",
  ENDED = "ended",
}

export interface ICallParticipant {
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  role: "initiator" | "receiver";
  status: CallStatus;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export interface ICallLog {
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
  metadata?: Record<string, any>;
}

export interface ICallLogDocument extends ICallLog, Document {}

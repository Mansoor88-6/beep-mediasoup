import { Document } from "mongoose";

export interface IParticipant {
  _id: string;
  username: string;
  avatar?: string;
  role?: "admin" | "member";
  joinedAt?: Date;
}

export interface IReaction {
  emoji: string;
  userId: string;
  username: string;
  timestamp: Date;
}

export interface IMessage {
  _id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isSent: boolean;
  seenBy: string[];
  reactions?: { [emoji: string]: IReaction[] };
  media?: {
    url: string;
    thumbnailUrl?: string;
    type: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface IChat {
  type: "individual" | "group";
  name?: string;
  description?: string;
  avatar?: string;
  participants: IParticipant[];
  messages: IMessage[];
  lastMessage?: string;
  unreadCount: { [userId: string]: number };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  encryptionKey: string;
}

export interface IChatDocument extends IChat, Document {}

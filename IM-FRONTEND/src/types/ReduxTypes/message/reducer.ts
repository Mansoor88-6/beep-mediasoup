import { IMessage } from 'views/messaging/components/types';
// export interface IMessage {
//   _id: string;
//   senderId: string;
//   text: string;
//   timestamp: Date;
//   isSent: boolean;
//   seenBy: string[];
//   reactions?: { [emoji: string]: IReaction[] };
//   media?: {
//     type: 'image' | 'video' | 'document' | 'voice';
//     url: string;
//     fileName: string;
//     fileSize?: number;
//     thumbnailUrl?: string;
//     width?: number;
//     height?: number;
//     mimeType?: string;
//     duration?: number;
//   };
// }

export interface IParticipant {
  _id: string;
  username: string;
  avatar?: string;
  role?: 'admin' | 'member';
  joinedAt?: Date;
}

export interface IChat {
  _id: string;
  type: 'individual' | 'group';
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
}

export interface IParticipant {
  _id: string;
  username: string;
  avatar?: string;
  role?: 'admin' | 'member';
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
  reactions?: IReaction[];
  media?: {
    type: 'image' | 'video' | 'document' | 'voice';
    url: string;
    fileName: string;
    fileSize?: number;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    mimeType?: string;
    duration?: number;
  };
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

export interface IChatListProps {
  onChatSelect?: (chatId: string) => void;
}

export interface IChatListItemProps {
  chat: IChat;
  onChatSelect?: (chatId: string) => void;
  isActive?: boolean;
}

export interface IMessageProps {
  _id?: string;
  text: string;
  timestamp?: Date;
  received?: boolean;
  isSent?: boolean;
  seenBy?: string[];
  senderId?: string;
  reactions?: IReaction[];
}

export interface IGroupListProps {
  onGroupSelect?: (groupId: string) => void;
}

export interface IGroupListItemProps {
  chat: IChat;
  onGroupSelect?: (groupId: string) => void;
  isActive?: boolean;
}

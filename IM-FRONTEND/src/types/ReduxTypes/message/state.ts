import { IChat } from './reducer';

export interface MessageState {
  chats: { [chatId: string]: IChat };
  availableParticipants: Array<{
    _id: string;
    username: string;
    avatar: string | null;
    email: string;
  }>;
  activeChat: string | null;
  loading: boolean;
  error: string | null;
}

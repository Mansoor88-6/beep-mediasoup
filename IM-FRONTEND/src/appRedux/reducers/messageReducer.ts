/* eslint-disable jsdoc/check-types */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageState } from 'types/ReduxTypes/message';
import { IChat, IMessage } from 'views/messaging/components/types';

const initialState: MessageState = {
  chats: {},
  availableParticipants: [],
  activeChat: null,
  loading: false,
  error: null
};

const messageSlice = createSlice({
  name: 'messages',
  initialState: initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<string>) => {
      state.activeChat = action.payload;
    },
    updateChat: (state, { payload }: PayloadAction<IChat>) => {
      const chat = payload;
      const baseChat = {
        ...state.chats[chat._id],
        ...chat,
        type: chat.type || 'individual',
        participants: chat.participants.map((p) => {
          return {
            ...p,
            role: p.role || 'member'
          };
        }),
        updatedAt: chat.updatedAt || new Date().toISOString()
      };

      // Always update the chat in state
      state.chats[chat._id] = baseChat;

      // Sort chats by updatedAt timestamp
      const sortedChats = Object.entries(state.chats).sort(([, a], [, b]) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      // Reconstruct the chats object in sorted order
      state.chats = Object.fromEntries(sortedChats);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAvailableParticipants: (
      state,
      action: PayloadAction<MessageState['availableParticipants']>
    ) => {
      state.availableParticipants = action.payload;
    },
    addChat: (state, action: PayloadAction<IChat>) => {
      state.chats[action.payload._id] = action.payload;
    },
    setChats: (state, action: PayloadAction<{ [key: string]: IChat }>) => {
      state.chats = action.payload;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        isSent: boolean;
        tempId?: string;
        seenBy?: string[];
      }>
    ) => {
      const { chatId, messageId, isSent, tempId, seenBy } = action.payload;
      const chat = state.chats[chatId];
      if (chat) {
        chat.messages = chat.messages.map((msg) => {
          if (msg._id === messageId || msg._id === tempId) {
            return {
              ...msg,
              _id: messageId,
              isSent: isSent,
              seenBy: seenBy || msg.seenBy
            };
          }
          return msg;
        });
      }
    },
    addMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage;
      }>
    ) => {
      const { chatId, message } = action.payload;
      if (state.chats[chatId]) {
        // Add the message
        state.chats[chatId].messages.push(message);

        // Update chat's timestamp
        state.chats[chatId].updatedAt = message.timestamp || new Date().toISOString();

        // Update unread count if chat is not active
        if (state.activeChat !== chatId) {
          const chat = state.chats[chatId];
          const recipients = chat.participants
            .filter((p) => {
              return p._id !== message.senderId;
            })
            .map((p) => {
              return p._id;
            });

          recipients.forEach((recipientId) => {
            state.chats[chatId].unreadCount = {
              ...state.chats[chatId].unreadCount,
              [recipientId]: (state.chats[chatId].unreadCount[recipientId] || 0) + 1
            };
          });
        }

        // Sort chats by updatedAt timestamp
        const sortedChats = Object.entries(state.chats).sort(([, a], [, b]) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        // Reconstruct the chats object in sorted order
        state.chats = Object.fromEntries(sortedChats);
      }
    },
    resetUnreadCount: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
      }>
    ) => {
      const { chatId, userId } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].unreadCount = {
          ...state.chats[chatId].unreadCount,
          [userId]: 0
        };
      }
    }
  }
});

export const {
  setActiveChat,
  updateChat,
  setLoading,
  setError,
  setAvailableParticipants,
  addChat,
  setChats,
  updateMessageStatus,
  addMessage,
  resetUnreadCount
} = messageSlice.actions;

export default messageSlice.reducer;

/**
 * Exported selector for usage in components
 * @param {Object<MessageState>} state - The state of authentication
 * @param {MessageState} state.messages - The state of auth state
 * @returns {MessageState} returns auth state object
 */
export const MessageSelector = (state: { messages: MessageState }) => {
  const activeChat = state.messages.activeChat;
  const currentChat = activeChat ? state.messages.chats[activeChat] : null;

  return {
    activeChat: activeChat,
    currentChat: currentChat,
    messages: currentChat?.messages || []
  };
};

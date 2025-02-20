/* eslint-disable jsdoc/check-types */
import { ONE } from 'constant';
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
    updateChat: (state, action: PayloadAction<IChat>) => {
      const chat = action.payload;
      const updatedChats = {
        [chat._id]: {
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
        },
        ...state.chats
      };

      const sortedChats = Object.fromEntries(
        Object.entries(updatedChats).sort(([, a], [, b]) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
      );

      return {
        ...state,
        chats: sortedChats
      };
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
      console.log('retrieved chat before update', JSON.stringify(state.chats[chatId]));
      if (chat) {
        const messageIndex = chat.messages.findIndex((msg) => {
          return msg._id === messageId || msg._id === tempId;
        });
        if (messageIndex !== -ONE) {
          chat.messages[messageIndex] = {
            ...chat.messages[messageIndex],
            _id: messageId,
            isSent: isSent,
            ...(seenBy && { seenBy: seenBy })
          };
        }
      }
      console.log('retrieved chat after update', JSON.stringify(state.chats[chatId]));
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
        state.chats[chatId].messages.push(message);
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
  addMessage
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

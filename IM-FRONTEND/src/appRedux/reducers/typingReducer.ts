import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

interface TypingState {
  [chatId: string]: TypingUser[];
}

const initialState: TypingState = {};

const typingSlice = createSlice({
  name: 'typing',
  initialState,
  reducers: {
    setUserTyping: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        username: string;
      }>
    ) => {
      const { chatId, userId, username } = action.payload;
      if (!state[chatId]) {
        state[chatId] = [];
      }

      // Remove existing entry for this user if exists
      state[chatId] = state[chatId].filter((user) => {
        return user.userId !== userId;
      });

      // Add new typing status
      state[chatId].push({
        userId,
        username,
        timestamp: Date.now()
      });
    },
    removeUserTyping: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
      }>
    ) => {
      const { chatId, userId } = action.payload;
      if (state[chatId]) {
        state[chatId] = state[chatId].filter((user) => {
          return user.userId !== userId;
        });
        // Clean up empty arrays
        if (state[chatId].length === 0) {
          delete state[chatId];
        }
      }
    },
    // Clean up old typing statuses (older than 5 seconds)
    cleanupTypingStatus: (state) => {
      const now = Date.now();
      const TIMEOUT = 5000; // 5 seconds

      Object.keys(state).forEach((chatId) => {
        state[chatId] = state[chatId].filter((user) => {
          return now - user.timestamp < TIMEOUT;
        });
        if (state[chatId].length === 0) {
          delete state[chatId];
        }
      });
    }
  }
});

export const { setUserTyping, removeUserTyping, cleanupTypingStatus } = typingSlice.actions;
export default typingSlice.reducer;

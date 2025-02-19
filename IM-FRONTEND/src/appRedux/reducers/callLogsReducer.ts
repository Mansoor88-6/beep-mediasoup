import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CallLogsState, ICallLog } from 'types/ReduxTypes/callLogs';

const initialState: CallLogsState = {
  logs: [],
  chatLogs: {},
  loading: false,
  error: null
};

const callLogsSlice = createSlice({
  name: 'callLogs',
  initialState: initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCallLogs: (state, action: PayloadAction<ICallLog[]>) => {
      state.logs = action.payload;
      state.loading = false;
      state.error = null;
    },
    setChatCallLogs: (state, action: PayloadAction<{ chatId: string; logs: ICallLog[] }>) => {
      state.chatLogs[action.payload.chatId] = action.payload.logs;
      state.loading = false;
      state.error = null;
    },
    addCallLog: (state, action: PayloadAction<ICallLog>) => {
      // Add to general logs
      state.logs.unshift(action.payload);

      // Add to chat specific logs if they exist
      if (state.chatLogs[action.payload.chatId]) {
        state.chatLogs[action.payload.chatId].unshift(action.payload);
      }
    },
    updateCallLog: (state, action: PayloadAction<ICallLog>) => {
      // Update in general logs
      const logIndex = state.logs.findIndex((log) => {
        return log._id === action.payload._id;
      });
      if (logIndex !== -1) {
        state.logs[logIndex] = action.payload;
      }

      // Update in chat specific logs
      if (state.chatLogs[action.payload.chatId]) {
        const chatLogIndex = state.chatLogs[action.payload.chatId].findIndex((log) => {
          return log._id === action.payload._id;
        });
        if (chatLogIndex !== -1) {
          state.chatLogs[action.payload.chatId][chatLogIndex] = action.payload;
        }
      }
    },
    clearCallLogs: (state) => {
      state.logs = [];
      state.chatLogs = {};
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setCallLogs,
  setChatCallLogs,
  addCallLog,
  updateCallLog,
  clearCallLogs
} = callLogsSlice.actions;

export default callLogsSlice.reducer;

/**
 * Selector for call logs
 * @param state - The state
 * @param state.callLogs - The call logs state
 * @returns The call logs state
 */
export const CallLogsSelector = (state: { callLogs: CallLogsState }) => {
  return state.callLogs;
};

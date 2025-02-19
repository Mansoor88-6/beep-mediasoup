import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface OnlineUsersState {
  onlineUsers: string[];
}

const initialState: OnlineUsersState = {
  onlineUsers: []
};

const onlineUsersSlice = createSlice({
  name: 'onlineUsers',
  initialState: initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    }
  }
});

export const { setOnlineUsers } = onlineUsersSlice.actions;

/**
 * Selector for the online users state
 * @param state - The state
 * @returns The online users state
 */
export const OnlineUsersSelector = (state: RootState) => {
  return state.onlineUsers.onlineUsers;
};

export default onlineUsersSlice.reducer;

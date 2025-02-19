/* eslint-disable jsdoc/check-types */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser, UserState } from 'types/ReduxTypes/user';

const initialState: UserState = {
  users: [],
  usersLoading: false
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    getUsersSuccess: (state, { payload }: PayloadAction<IUser[]>) => {
      state.users = payload;
      state.usersLoading = false;
    },
    getUsersFailure: (state) => {
      state.usersLoading = false;
    },
    userReset: () => {
      return initialState;
    }
  }
});

export const { userReset, getUsersFailure, getUsersSuccess } = userSlice.actions;

export default userSlice.reducer;

/**
 * Exported selector for usage in components
 * @param {Object<UserState>} state - The state of user
 * @param {UserState} state.user - The state of user state
 * @returns {UserState} returns user state object
 */
export const UserSelector = (state: { user: UserState }): UserState => {
  return state.user;
};

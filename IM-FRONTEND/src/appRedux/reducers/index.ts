import { combineReducers, CombinedState, Reducer } from '@reduxjs/toolkit';
import { RESET } from 'appRedux/middleware/root/events';

// reducers
import callReducer from './callReducer';
import userReducer, { UserSelector } from './userReducer';
import authReducer, { AuthSelector } from './authReducer';
import alertReducer, { AlertSelector } from './alertReducer';
import roomReducer, { RoomSelector } from './roomReducer';
import messageReducer, { MessageSelector } from './messageReducer';
import callLogsReducer, { CallLogsSelector } from './callLogsReducer';
import onlineUsersReducer, { OnlineUsersSelector } from './onlineUsersReducer';
import typingReducer from './typingReducer';

const appReducer = combineReducers({
  auth: authReducer,
  alert: alertReducer,
  user: userReducer,
  messages: messageReducer,
  call: callReducer,
  room: roomReducer,
  callLogs: callLogsReducer,
  onlineUsers: onlineUsersReducer,
  typing: typingReducer
});

export {
  AuthSelector,
  AlertSelector,
  UserSelector,
  MessageSelector,
  RoomSelector,
  CallLogsSelector,
  OnlineUsersSelector
};

export type RootState = ReturnType<typeof appReducer>;

/**
 * Resets state on logout if needed
 * @param {RootState} state - current action state dispatched from actions
 * @param {any} action - current action dispatched
 * @returns {Reducer<CombinedState>} returns combined state
 */
export const rootReducer = (state: RootState, action: any) => {
  if (action.type === RESET) {
    return appReducer({} as RootState, action);
  }
  return appReducer(state, action);
};

export default appReducer;

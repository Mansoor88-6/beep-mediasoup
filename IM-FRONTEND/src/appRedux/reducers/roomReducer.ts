/* eslint-disable jsdoc/check-types */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IRoom, RoomState } from 'types/ReduxTypes/room';

const initialState: RoomState = {
  rooms: null,
  roomsLoading: false
};

const roomSlice = createSlice({
  name: 'room',
  initialState: initialState,
  reducers: {
    getRoomsSuccess: (state, { payload }: PayloadAction<IRoom[]>) => {
      state.rooms = payload;
      state.roomsLoading = false;
    },
    addUpdateRoomSuccess: (state, { payload }: PayloadAction<IRoom>) => {
      state.roomsLoading = true;
      state.rooms = state.rooms?.map((room) => {
        return room._id === payload._id ? payload : room;
      }) || [payload];
      state.roomsLoading = false;
    },
    getRoomsFailures: (state) => {
      state.roomsLoading = false;
    },
    addUpdateRoomFailure: (state) => {
      return state;
    }
  }
});

export const { addUpdateRoomSuccess, addUpdateRoomFailure, getRoomsSuccess, getRoomsFailures } =
  roomSlice.actions;

export default roomSlice.reducer;

/**
 * Exported selector for usage in components
 * @param {Object<RoomState>} state - The state of authentication
 * @param {RoomState} state.room - The state of auth state
 * @returns {RoomState} returns auth state object
 */
export const RoomSelector = (state: { room: RoomState }) => {
  return state.room;
};

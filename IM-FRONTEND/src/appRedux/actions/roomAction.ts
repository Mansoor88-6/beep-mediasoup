/* eslint-disable no-useless-catch */
/* eslint-disable no-magic-numbers */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BackendInstance, config } from 'config';

import {
  addUpdateRoomSuccess,
  getRoomsSuccess,
  getRoomsFailures,
  addUpdateRoomFailure
} from 'appRedux/reducers/roomReducer';
import { updateAlert } from './alertAction';
import { handlerError } from 'utils/ErrorHandler';
import { IAddUpdateRoomAction } from 'types/ReduxTypes/room';

export const getRooms = createAsyncThunk('room/getRooms', async (_, { dispatch }) => {
  try {
    const res = await BackendInstance.get('room/', config);
    dispatch(getRoomsSuccess(res.data.data));
    return true;
  } catch (err) {
    dispatch(getRoomsFailures());
    handlerError(err).forEach((error: string) => {
      dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
    });
    return false;
  }
});

export const createRoom = createAsyncThunk(
  'room/create-room',
  async (data: IAddUpdateRoomAction, { dispatch }) => {
    const body = JSON.stringify(data);
    try {
      const res = await BackendInstance.post('room/', body, config);
      dispatch(addUpdateRoomSuccess(res.data.data));
      return true;
    } catch (err) {
      dispatch(addUpdateRoomFailure());
      handlerError(err).forEach((error: string) => {
        dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });
      return false;
    }
  }
);

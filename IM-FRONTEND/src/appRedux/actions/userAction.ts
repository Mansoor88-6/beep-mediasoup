import { config, BackendInstance } from 'config';
import {
  getUsersFailure,
  getUsersSuccess,
  getUserUpdateFailure,
  getUserUpdateSuccess,
  userReset
} from '../reducers/userReducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { handlerError } from 'utils/ErrorHandler';
import { updateAlert } from './alertAction';
import { IChangePasswordFormActionData } from 'types/ReduxTypes/user/action';
import { IUserUpdateData } from 'types/ReduxTypes/user/reducer';

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: IUserUpdateData, { dispatch }) => {
    try {
      const body = JSON.stringify(data);
      const res = await BackendInstance.post(`user/${data._id}`, body, config);
      dispatch(getUserUpdateSuccess(res.data.data));
      dispatch(updateAlert({ place: 'tc', message: res.data.message, type: 'success' }));
      return true;
    } catch (err) {
      dispatch(getUserUpdateFailure());
      handlerError(err).forEach((error: string) => {
        dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });
      return false;
    }
  }
);

export const getUsers = createAsyncThunk('user/getUsers', async (_, { dispatch }) => {
  try {
    const res = await BackendInstance.get('user/', config);
    dispatch(getUsersSuccess(res.data.data));
    return true;
  } catch (err) {
    dispatch(getUsersFailure());
    handlerError(err).forEach((error: string) => {
      dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
    });
    return false;
  }
});

export const deleteUsers = createAsyncThunk(
  'user/deleteUsers',
  async (data: string[], { dispatch }) => {
    try {
      await BackendInstance.delete('user/', {
        data: {
          userIds: data
        }
      });
      dispatch(
        updateAlert({ place: 'tc', message: 'Users deleted successfully', type: 'success' })
      );
      return true;
    } catch (err) {
      dispatch(getUsersFailure());
      handlerError(err).forEach((error: string) => {
        dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });
      return false;
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (data: IChangePasswordFormActionData, { dispatch }) => {
    try {
      const body = JSON.stringify(data);
      const res = await BackendInstance.post('user/password-override', body, config);
      dispatch(updateAlert({ place: 'tc', message: res.data.message, type: 'success' }));
      return true;
    } catch (err) {
      handlerError(err).forEach((error: string) => {
        dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });
      return false;
    }
  }
);

/**
 * Resets the user state
 * @param {any} _ - The dispatch object
 * @param {any} { dispatch } - The dispatch object
 * @returns {Promise<boolean>} true if the user state is reset, false otherwise
 */
export const resetUser = createAsyncThunk('user/resetUser', async (_, { dispatch }) => {
  try {
    dispatch(userReset());
    return true;
  } catch (err) {
    return false;
  }
});

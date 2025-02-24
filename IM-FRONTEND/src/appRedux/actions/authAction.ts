import { BackendInstance, config } from 'config';
import { handlerError } from '../../utils/ErrorHandler';
import { updateAlert } from './alertAction';
import { createAsyncThunk } from '@reduxjs/toolkit';

// types
import type {
  ILoginFormData,
  IValidTokenProps,
  IUser,
  IUserProfileProps,
  ILoginResponseData,
  IConfirmPasswordData,
  IRegisterFormData
} from 'types/ReduxTypes/auth';

// reducers
import {
  userLoaded,
  loginSuccess,
  validToken,
  updateUserProfileSuccess,
  updateUserProfileFailure,
  updateAvatarSuccess,
  updateAvatarFailure,
  authReset,
  clearSession,
  registerSuccess
} from '../reducers/authReducer';
import { IUserAvatarProps } from 'types/ReduxTypes/auth/action';

/**
 * creates user session and logs them in
 * @returns {boolean} true if login form is valid and successful, false otherwise
 */
export const Login = createAsyncThunk(
  'loginSlice/login',
  async (formData: ILoginFormData, { dispatch }) => {
    const body = JSON.stringify(formData);
    try {
      const res = await BackendInstance.post('user/login', body, config);
      const responseData = res.data.data as ILoginResponseData;
      // if (responseData.id) {
      //   // break before otp before loading user
      //   dispatch(updateAlert({ place: 'tc', message: res.data.msg, type: 'success' }));
      //   return responseData;
      // }
      dispatch(loginSuccess());
      dispatch(loadUser());
      return responseData;
    } catch (err) {
      handlerError(err).forEach((error: string) => {
        dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });

      dispatch(clearSession());
      return false;
    }
  }
);

/**
 * confirm password
 * @returns {boolean} true if password is confirmed else false
 */
export const confirmPassword = createAsyncThunk(
  'loginSlice/confirmPassword',
  async (formData: IConfirmPasswordData, { dispatch }) => {
    try {
      await BackendInstance.post('user/confirm-password', formData, config);
      /**
       * Will throw error if status is invalid
       */
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
 * registered new user
 * @returns {boolean} register
 */
export const register = createAsyncThunk(
  'registerSlice/register',
  async (formData: IRegisterFormData, { dispatch }) => {
    const body = JSON.stringify(formData);
    try {
      const res = await BackendInstance.post('user/register', body, config);
      dispatch(registerSuccess());
      dispatch(updateAlert({ place: 'tc', message: res.data.msg, type: 'success' }));
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
 * loads current user to state
 * @returns {boolean} true if user is loaded successfully
 */
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { dispatch }) => {
  try {
    const res = await BackendInstance.get('user/authorization');
    const { role, token } = res.data.data;
    await dispatch(
      userLoaded({
        role: role,
        user: { ...res.data.data } as IUser,
        token: token,
        isAuthenticated: true
      })
    );
    dispatch({
      type: 'CONNECT_SOCKET'
    });
    return true;
  } catch (err) {
    dispatch(clearSession());
    return false;
  }
});

/**
 * Logs out user and clears session
 * @returns {void}
 */
export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  document.location.assign('https://beepauth.averox.com/login');

  window.onbeforeunload = () => {
    return null;
  };

  // setTimeout(async () => {
  //   try {
  //     // dispatch({ type: DISCONNECT_SOCKET });
  //     // // dispatch({ type: RESET });
  //     // dispatch(authReset());
  //     // dispatch(clearSession());
  //     await userLogout();
  //   } catch (err) {
  //     // Cleanup failed but user is already being redirected
  //   }
  // }, 0);
});

/**
 * Validate user token
 * @param {IValidTokenProps} data - The data to validate token against
 * @returns {boolean} - True if token is valid and false otherwise
 */
export const isValidToken = createAsyncThunk(
  'auth/isValidToken',
  async (data: IValidTokenProps, { dispatch }) => {
    const body = JSON.stringify(data);

    try {
      const res = await BackendInstance.post('user/is-valid-token', body, config);

      dispatch(validToken({ invalidToken: true }));

      dispatch(updateAlert({ place: 'tc', message: res.data.msg, type: 'success' }));
      return true;
    } catch (err: any) {
      const errors = err.response && err.response.data && err.response.data.errors;
      dispatch(validToken({ invalidToken: false }));
      if (errors) {
        errors.forEach((error: any) => {
          dispatch(updateAlert({ place: 'tc', message: error.msg, type: 'danger' }));
        });
      }
      return false;
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: IUserProfileProps, { dispatch }) => {
    const body = JSON.stringify(data);
    try {
      const res = await BackendInstance.put(`user/profile`, body, config);
      dispatch(updateUserProfileSuccess(res.data.data));
      dispatch(updateAlert({ place: 'tc', message: res.data.msg, type: 'success' }));
      return true;
    } catch (err) {
      dispatch(updateUserProfileFailure());
      handlerError(err).forEach((error: string) => {
        return dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });
      return false;
    }
  }
);

export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async (data: IUserAvatarProps, { dispatch }) => {
    const multipartConfig = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    };
    const zero = 0;
    const form = new FormData();
    if (data.avatar) {
      form.append('file', data.avatar.fileList[zero].originFileObj as File);
    }
    try {
      const res = await BackendInstance.put('user/avatar', form, multipartConfig);
      dispatch(updateAvatarSuccess(res.data.data));
      dispatch(updateAlert({ place: 'tc', message: res.data.msg, type: 'success' }));
      return true;
    } catch (err) {
      dispatch(updateAvatarFailure());
      handlerError(err).forEach((error: string) => {
        return dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });
      return false;
    }
  }
);

/**
 * Reset all auth tokens and vars
 * @returns {boolean} true if Auth is reset successfully
 */
export const resetAuth = createAsyncThunk('auth/resetAuth', async (_, { dispatch }) => {
  try {
    dispatch(authReset());
    return true;
  } catch (err) {
    return false;
  }
});

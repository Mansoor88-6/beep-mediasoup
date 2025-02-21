import { removeSecondaryToken } from 'utils/Logout';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, IUser, IUserAavatar } from 'types/ReduxTypes/auth';

// TODO change this state by maniging it from redux
const initialState: AuthState = {
  token: null,
  isAuthenticated: null,
  isRegistered: null,
  loading: true,
  user: null,
  role: null,
  invalidToken: null,
  recentLoggedOut: false
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    userLoaded: (state, { payload }: PayloadAction<AuthState>) => {
      const authToken = payload.token;
      delete payload.token;

      state.isAuthenticated = payload.isAuthenticated;
      state.loading = false;
      state.role = payload.role;
      state.user = payload.user;
      state.token = authToken;
    },
    validToken: (state, { payload }: PayloadAction<AuthState>) => {
      state.invalidToken = payload.invalidToken;
    },
    registerSuccess: (state) => {
      return state;
    },
    loginSuccess: () => {},
    loginFailure: (state) => {
      return state;
    },
    updateUserProfileSuccess: (state, { payload }: PayloadAction<IUser>) => {
      state.user = { ...state.user, ...payload };
    },
    updateUserProfileFailure: (state) => {
      return state;
    },
    updateAvatarSuccess: (state, { payload }: PayloadAction<IUserAavatar>) => {
      state.user = { ...(state.user as IUser), avatar: payload.avatar };
    },
    updateAvatarFailure: (state) => {
      return state;
    },
    authReset: () => {
      return {
        ...initialState,
        recentLoggedOut: true
      };
    },
    clearSession: (state) => {
      removeSecondaryToken();
      state.isAuthenticated = false;
      state.loading = false;
      state.recentLoggedOut = false;
      /**
       * Dont set recentLoggedOut: true
       * here because as recentLoggedOut is set
       * in AuthLayout for loading condition and first
       * load user goes to catch (because of unathorization)
       * where this reducer is called which will make login
       * page in an ifinite loop.
       */
    }
  }
});

export const {
  userLoaded,
  validToken,
  registerSuccess,
  loginSuccess,
  updateUserProfileSuccess,
  updateUserProfileFailure,
  updateAvatarSuccess,
  updateAvatarFailure,
  authReset,
  clearSession
} = AuthSlice.actions;

export default AuthSlice.reducer;

/**
 * Exported selector for usage in components
 * @param {Object<AuthState>} state - The state of authentication
 * @param {AuthState} state.auth - The state of auth state
 * @returns {AuthState} returns auth state object
 */
export const AuthSelector = (state: { auth: AuthState }): AuthState => {
  return state.auth;
};

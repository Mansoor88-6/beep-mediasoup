import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { IAlert } from 'types/ReduxTypes/alert';

const initialState: Array<IAlert> = [];

const AlertSlice = createSlice({
  name: 'alert',
  initialState: initialState,
  reducers: {
    setAlert: (state, { payload }: PayloadAction<IAlert>) => {
      const NOT_FOUND = -1;
      const currentState = current(state);
      const sameMessageIndex = currentState.findIndex((alert) => {
        return alert.message === payload.message;
      });
      if (sameMessageIndex === NOT_FOUND) {
        state.push(payload);
      }
    },
    removeAlert: (state, { payload }: PayloadAction<IAlert>) => {
      // eslint-disable-next-line no-param-reassign
      state.splice(
        state.findIndex((alert) => {
          return alert.id === payload.id;
        })
      );
    },
    resetAlert: () => {
      return initialState;
    }
  }
});

export const { setAlert, removeAlert, resetAlert } = AlertSlice.actions;

export default AlertSlice.reducer;

/**
 * Exported selector for usage in components
 * @param {Object<Array<IAlert>>} state - The state of alerts
 * @param {IAlert} state.alert - The state of alert state
 * @returns {IAlert} returns alert state object
 */
export const AlertSelector = (state: { alert: Array<IAlert> }) => {
  return state.alert;
};

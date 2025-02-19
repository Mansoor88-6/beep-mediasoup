import { v4 } from 'uuid';
import { createAsyncThunk } from '@reduxjs/toolkit';

// reducers
import { setAlert, removeAlert, resetAlert } from '../reducers/alertReducer';
import { IAlert } from 'types/ReduxTypes/alert';

const ALERT_TIMEOUT = 5000;
/**
 * Set/Update alert state
 * @param {string} place - The place to display the alert message (tl, tr, tc, br, bl, bc)
 * @param {string} message - The message to display for the alert
 * @param {string} type - The type of alert message (info, success, warning, danger, primary)
 * @param {number} timeout - The number of seconds to wait before alert disappear
 * @returns {number} id - The id of the alert message
 */
export const updateAlert = createAsyncThunk(
  'alert/setAlert',
  async ({ place, message, type, timeout = ALERT_TIMEOUT }: IAlert, { dispatch }) => {
    const id = v4();
    dispatch(setAlert({ id: id, place: place, message: message, type: type, timeout: timeout }));
    setTimeout(() => {
      dispatch(removeAlert({ id: id }));
    }, timeout);
    return id;
  }
);

export const deleteAlert = createAsyncThunk(
  'alert/deleteAlert',
  async (id: string, { dispatch }) => {
    dispatch(removeAlert({ id: id }));
  }
);

export const clearAlerts = createAsyncThunk('alert/clearAlerts', async (_, { dispatch }) => {
  try {
    dispatch(resetAlert());
    return true;
  } catch (err) {
    return false;
  }
});

import { createAsyncThunk } from '@reduxjs/toolkit';
import { BackendInstance, config } from 'config';
import { setLoading, setError, setCallLogs, setChatCallLogs } from '../reducers/callLogsReducer';
import { ICallLog } from 'types/ReduxTypes/callLogs';
import { handlerError } from 'utils/ErrorHandler';
import { updateAlert } from './alertAction';

/**
 * Fetch all call logs for the authenticated user
 */
export const fetchCallLogs = createAsyncThunk('callLogs/fetchAll', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const response = await BackendInstance.get<{ data: ICallLog[] }>(`calls/logs/`, config);
    dispatch(setCallLogs(response.data.data));
    return response.data.data;
  } catch (err) {
    handlerError(err).forEach((error: string) => {
      dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
    });
    dispatch(setError('Failed to fetch call logs'));
    return [];
  }
});

/**
 * Fetch call logs for a specific chat
 */
export const fetchChatCallLogs = createAsyncThunk(
  'callLogs/fetchChat',
  async (chatId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await BackendInstance.get<{ data: ICallLog[] }>(
        `calls/logs/chat/${chatId}`,
        config
      );
      dispatch(setChatCallLogs({ chatId: chatId, logs: response.data.data }));
      return response.data.data;
    } catch (err) {
      handlerError(err).forEach((error: string) => {
        dispatch(updateAlert({ place: 'tc', message: error, type: 'danger' }));
      });
      dispatch(setError(`Failed to fetch call logs for chat ${chatId}`));
      return [];
    }
  }
);

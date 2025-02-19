import { configureStore, Action, Reducer } from '@reduxjs/toolkit';
import { env } from 'config';
import { useDispatch } from 'react-redux';
import { ThunkAction } from 'redux-thunk';
import { Environment } from 'types';
// Reducers
import appReducer, { rootReducer } from './reducers';
import Socket from './middleware/socket/socketMiddleware';

/**
 * ********************** REDUX TOOLKIT ***************************
 * ****************************************************************
 *
 * ******************* TO ADD NEW REDUX STATE *********************
 * Step 1: Create a new reducer with initialState, slice, and exports(state setters, reducers, and selectors)
 * Step 2: Create associated actions for reducer in redux/actions
 * Step 3: Add it in redux/index.ts
 *
 * ****************************************************************
 * ******************* TO ACCESS IN COMPONENTS ********************
 * Please use useSelector from 'react-redux' and selector from
 * their respective reducers e.g. for redux active state
 *
 * import { ReduxSelector } from 'redux/reducers/redux';
 * import { useSelector } from 'react-redux';
 * const { active } = useSelector(ReduxSelector);
 *
 * ****************************************************************
 * ***************** TO CHANGE STATE IN COMPONENT *****************
 * Please use useDispatch to create dispatch and then use it to use
 * actions e.g. for toggle redux state
 *
 * import { useDispatch } from "react-redux"
 * import { setLoading } from 'redux/actions/redux';
 *
 * const component = () => {
 *      const dispatch = useDispatch()
 *      dispatch(setLoading())
 * }
 *
 */

export type RootState = ReturnType<typeof appReducer>;

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

const store = configureStore({
  reducer: rootReducer as Reducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false }).concat([Socket.socketMiddleware]);
  },
  devTools: env === Environment.Development
});

export type AppDispatch = typeof store.dispatch;
/**
 * App dispatch as a replacement for default useDispatch hook
 * @returns {AppDispatch} returns app dispatch instance for store.dispatch
 */
export const useAppDispatch = () => {
  return useDispatch<AppDispatch>();
};

export default store;

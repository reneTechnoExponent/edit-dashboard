import { configureStore } from '@reduxjs/toolkit';
import { adminApi } from './api';
import authReducer from '@/features/auth/authSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      [adminApi.reducerPath]: adminApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(adminApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

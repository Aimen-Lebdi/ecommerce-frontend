// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from '../features/categories/categoriesSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

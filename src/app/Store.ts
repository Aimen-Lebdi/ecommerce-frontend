// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "../features/categories/categoriesSlice";
import subCategoriesReducer from "../features/subCategories/subCategoriesSlice";
import brandsReducer from "../features/brands/brandsSlice";
import productsReducer from "../features/products/productsSlice";
import ordersReducer from "../features/orders/ordersSlice";
import usersReducer from "../features/users/usersSlice";
import activitiesReducer from "../features/activities/activitiesSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    subCategories: subCategoriesReducer,
    brands: brandsReducer,
    products: productsReducer,
    orders: ordersReducer,
    users: usersReducer,
    activities: activitiesReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types for use in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

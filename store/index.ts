import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import cartReducer from './slices/cartSlice';
import customerSessionReducer from './slices/customerSessionSlice';
import ordersReducer from './slices/ordersSlice';
import notificationsReducer from './slices/notificationsSlice';
import tablesReducer from './slices/tablesSlice';
import adminUiReducer from './slices/adminUiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    customerSession: customerSessionReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
    tables: tablesReducer,
    adminUi: adminUiReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

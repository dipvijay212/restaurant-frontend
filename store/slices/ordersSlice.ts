import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../../types/order';

interface OrdersState {
  orders: Order[];
  activeFilter: OrderStatus | 'all';
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  activeFilter: 'all',
  loading: false,
  error: null,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrderStatusInStore: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index > -1) {
        state.orders[index].status = action.payload.status;
        state.orders[index].updatedAt = new Date().toISOString();
      }
    },
    setOrdersFilter: (state, action: PayloadAction<OrderStatus | 'all'>) => {
      state.activeFilter = action.payload;
    },
    setOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setOrdersError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrderStatusInStore,
  setOrdersFilter,
  setOrdersLoading,
  setOrdersError,
} = ordersSlice.actions;

export default ordersSlice.reducer;

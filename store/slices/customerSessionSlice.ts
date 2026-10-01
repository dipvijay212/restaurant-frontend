import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CustomerSession,
  SessionTableInfo,
  SessionRestaurantInfo,
  CustomerSessionStatus,
} from '../../types/customer';

const STORAGE_KEY = 'demo_restaurant_customer_session';

const loadSessionFromStorage = (): CustomerSession => {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getInitialState(), ...parsed };
    }
  } catch (err) {
    console.error('Failed to load session from localStorage', err);
  }
  return getInitialState();
};

function getInitialState(): CustomerSession {
  return {
    sessionId: null,
    table: null,
    restaurant: null,
    sessionStatus: null,
    customerName: 'Guest',
    phone: '',
    guestCount: 1,
    sessionStartTime: null,
    currentOrderId: null,
    isAuthenticated: false,
  };
}

const initialState: CustomerSession = loadSessionFromStorage();

export const customerSessionSlice = createSlice({
  name: 'customerSession',
  initialState,
  reducers: {
    initializeSession: (
      state,
      action: PayloadAction<{
        table: SessionTableInfo;
        restaurant: SessionRestaurantInfo;
        status: CustomerSessionStatus;
        customerName?: string;
        guestCount?: number;
      }>
    ) => {
      const { table, restaurant, status, customerName = 'Guest', guestCount = 2 } = action.payload;
      state.sessionId = `sess-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      state.table = table;
      state.restaurant = restaurant;
      state.sessionStatus = status;
      state.customerName = customerName;
      state.guestCount = guestCount;
      state.sessionStartTime = new Date().toISOString();
      state.isAuthenticated = true;

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
          console.error('LocalStorage write error', e);
        }
      }
    },

    updateGuestInfo: (
      state,
      action: PayloadAction<{ customerName?: string; phone?: string; guestCount?: number }>
    ) => {
      if (action.payload.customerName !== undefined) state.customerName = action.payload.customerName;
      if (action.payload.phone !== undefined) state.phone = action.payload.phone;
      if (action.payload.guestCount !== undefined) state.guestCount = action.payload.guestCount;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {}
      }
    },

    setCurrentOrderId: (state, action: PayloadAction<string | null>) => {
      state.currentOrderId = action.payload;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {}
      }
    },

    endSession: (state) => {
      Object.assign(state, getInitialState());
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
      }
    },
  },
});

export const { initializeSession, updateGuestInfo, setCurrentOrderId, endSession } =
  customerSessionSlice.actions;

export default customerSessionSlice.reducer;

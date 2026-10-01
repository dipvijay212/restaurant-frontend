import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StaffRole } from '../../types/staff';

export type AuthRole = 'OWNER' | 'MANAGER' | 'KITCHEN' | 'WAITER' | 'CASHIER';

export interface AuthenticatedStaff {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  avatarUrl?: string;
  phone?: string;
  token?: string;
}

interface AuthState {
  user: AuthenticatedStaff | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const STORAGE_KEY = 'demo_restaurant_auth_staff';

const loadPersistedAuth = (): AuthenticatedStaff | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

const initialUser = loadPersistedAuth();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: Boolean(initialUser),
  loading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action: PayloadAction<AuthenticatedStaff>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
  },
});

export const { setAuthenticatedUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;

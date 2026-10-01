import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminUiState {
  sidebarOpen: boolean;
  themeMode: 'light' | 'dark';
  activeTab: string;
  searchQuery: string;
}

const initialState: AdminUiState = {
  sidebarOpen: true,
  themeMode: 'light',
  activeTab: 'overview',
  searchQuery: '',
};

export const adminUiSlice = createSlice({
  name: 'adminUi',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setThemeMode,
  setActiveTab,
  setSearchQuery,
} = adminUiSlice.actions;

export default adminUiSlice.reducer;

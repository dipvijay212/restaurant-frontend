import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Table, TableStatus } from '../../types/table';

interface TablesState {
  tables: Table[];
  selectedArea: string | 'all';
  loading: boolean;
  error: string | null;
}

const initialState: TablesState = {
  tables: [],
  selectedArea: 'all',
  loading: false,
  error: null,
};

export const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables: (state, action: PayloadAction<Table[]>) => {
      state.tables = action.payload;
    },
    updateTableStatusInStore: (
      state,
      action: PayloadAction<{ id: string; status: TableStatus; customerName?: string; orderId?: string }>
    ) => {
      const index = state.tables.findIndex((t) => t.id === action.payload.id);
      if (index > -1) {
        state.tables[index].status = action.payload.status;
        if (action.payload.customerName !== undefined) {
          state.tables[index].currentCustomerName = action.payload.customerName;
        }
        if (action.payload.orderId !== undefined) {
          state.tables[index].currentOrderId = action.payload.orderId;
        }
      }
    },
    setSelectedArea: (state, action: PayloadAction<string>) => {
      state.selectedArea = action.payload;
    },
    setTablesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTablesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTables,
  updateTableStatusInStore,
  setSelectedArea,
  setTablesLoading,
  setTablesError,
} = tablesSlice.actions;

export default tablesSlice.reducer;

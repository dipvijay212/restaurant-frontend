import { initialTablesData } from '../../mock/tables';
import { Table, TableStatus, TableArea } from '../../types/table';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let tablesState: Table[] = [...initialTablesData];

export const tablesApi = {
  getTables: async (): Promise<Table[]> => {
    await delay();
    return [...tablesState].sort((a, b) => a.tableNumber - b.tableNumber);
  },

  getTableById: async (id: string): Promise<Table | null> => {
    await delay();
    const table = tablesState.find((t) => t.id === id);
    return table ? { ...table } : null;
  },

  getTableByNumber: async (tableNumber: number): Promise<Table | null> => {
    await delay();
    const table = tablesState.find((t) => t.tableNumber === tableNumber);
    return table ? { ...table } : null;
  },

  createTable: async (data: { tableNumber: number; capacity: number; area: TableArea }): Promise<Table> => {
    await delay();
    const existing = tablesState.find((t) => t.tableNumber === data.tableNumber);
    if (existing) {
      throw new Error(`Table #${data.tableNumber} already exists in ${existing.area}.`);
    }

    const newTable: Table = {
      id: `tbl-${Date.now()}`,
      tableNumber: data.tableNumber,
      capacity: data.capacity,
      area: data.area,
      status: 'AVAILABLE',
      isActive: true,
      qrToken: `table-demo-${data.tableNumber}`,
      qrCodeUrl: `/qr/table-${data.tableNumber}.png`,
    };

    tablesState.push(newTable);
    return newTable;
  },

  updateTable: async (id: string, data: Partial<Table>): Promise<Table> => {
    await delay();
    const index = tablesState.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Table not found');

    const updated: Table = {
      ...tablesState[index],
      ...data,
    };
    tablesState[index] = updated;
    return updated;
  },

  toggleTableActiveStatus: async (id: string): Promise<Table> => {
    await delay();
    const index = tablesState.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Table not found');

    const currentStatus = tablesState[index].isActive;
    tablesState[index] = {
      ...tablesState[index],
      isActive: !currentStatus,
    };
    return tablesState[index];
  },

  regenerateQR: async (id: string): Promise<Table> => {
    await delay();
    const index = tablesState.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Table not found');

    const newToken = `table-demo-${tablesState[index].tableNumber}-${Date.now().toString().slice(-4)}`;
    tablesState[index] = {
      ...tablesState[index],
      qrToken: newToken,
      qrCodeUrl: `/qr/${newToken}.png`,
    };
    return tablesState[index];
  },

  updateTableStatus: async (
    id: string,
    status: TableStatus,
    customerName?: string,
    orderId?: string
  ): Promise<Table> => {
    await delay();
    const index = tablesState.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Table not found');

    const updatedTable: Table = {
      ...tablesState[index],
      status,
      currentCustomerName: customerName ?? (['AVAILABLE', 'available'].includes(status) ? undefined : tablesState[index].currentCustomerName),
      currentOrderId: orderId ?? (['AVAILABLE', 'available'].includes(status) ? undefined : tablesState[index].currentOrderId),
      occupiedSince: ['OCCUPIED', 'occupied'].includes(status) ? new Date().toISOString() : (['AVAILABLE', 'available'].includes(status) ? undefined : tablesState[index].occupiedSince),
    };

    tablesState[index] = updatedTable;
    return updatedTable;
  },
};

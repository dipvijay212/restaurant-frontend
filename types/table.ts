export type TableStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'WAITING_FOR_SERVICE'
  | 'BILL_REQUESTED'
  | 'CLEANING'
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'needs-cleaning';

export type TableArea = 'Main Dining' | 'Terrace' | 'VIP Section' | 'Bar Area';

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  area: TableArea;
  status: TableStatus;
  isActive: boolean;
  qrToken: string;
  qrCodeUrl: string;
  currentSessionId?: string;
  currentOrderId?: string;
  currentCustomerName?: string;
  currentOrderTotal?: number;
  occupiedSince?: string;
}

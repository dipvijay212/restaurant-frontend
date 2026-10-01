import { OrderItem } from './order';

export type BillStatus =
  | 'UNPAID'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'unpaid'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_paid';

export type SplitType = 'equal' | 'by_item' | 'custom';

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  orderId?: string;
  sessionId?: string;
  tableNumber: number;
  customerName: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
  status: BillStatus;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

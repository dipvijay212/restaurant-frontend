import { MenuItem, ProductOption } from './menu';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type OrderType = 'dine-in' | 'takeaway';
export type OrderPaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface SelectedOption {
  groupId: string;
  groupName: string;
  option: ProductOption;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions?: SelectedOption[];
  specialInstructions?: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableNumber?: number;
  sessionId?: string;
  customerName: string;
  customerPhone?: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  specialNotes?: string;
  statusHistory?: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
  estimatedTimeMinutes?: number;
}

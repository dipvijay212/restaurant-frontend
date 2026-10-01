export type PaymentMethod = 'cash' | 'counter' | 'upi' | 'card' | 'online' | 'apple_pay';
export type PaymentStatus =
  | 'unpaid'
  | 'processing'
  | 'completed'
  | 'successful'
  | 'failed'
  | 'cancelled';

export interface PaymentTransaction {
  id: string;
  billId: string;
  orderId?: string;
  tableNumber: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  errorMessage?: string;
  createdAt: string;
}

export type Payment = PaymentTransaction;

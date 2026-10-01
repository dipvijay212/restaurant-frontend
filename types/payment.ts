export type PaymentMethod =
  | 'cashfree'
  | 'online'
  | 'card'
  | 'upi'
  | 'cash'
  | 'counter'
  | 'apple_pay'
  | 'Cashfree Online'
  | 'Credit/Debit Card'
  | 'UPI / QR'
  | 'Cash at Counter';

export type PaymentStatus =
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'processing'
  | 'success'
  | 'successful'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'unpaid';

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  billId: string;
  billNumber?: string;
  orderId?: string;
  tableNumber: number;
  customerName?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  errorMessage?: string;
  gatewayName?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Payment = PaymentTransaction;

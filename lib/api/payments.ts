import { Payment, PaymentMethod, PaymentStatus } from '../../types/payment';
import { billsApi } from './bills';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

let paymentsState: Payment[] = [
  {
    id: 'pay-01',
    billId: 'bill-104',
    orderId: 'ord-104',
    tableNumber: 10,
    amount: 29.51,
    method: 'card',
    status: 'completed',
    transactionRef: 'TXN-98412389',
    createdAt: '2026-10-01T14:15:00Z',
  }
];

export interface PaymentGatewayRequest {
  billId: string;
  orderId?: string;
  tableNumber: number;
  amount: number;
  method: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  status: PaymentStatus;
  transactionRef?: string;
  payment?: Payment;
  errorMessage?: string;
}

/**
 * Extensible Payment Gateway Adapter interface.
 * Can be swapped with Cashfree SDK / Cashfree API client seamlessly in the future.
 */
export const paymentsApi = {
  getPayments: async (): Promise<Payment[]> => {
    await delay(150);
    return [...paymentsState];
  },

  /**
   * Process payment (Online or Counter).
   * For online payment, outcome can be simulated as 'success', 'failed', or 'cancelled'.
   */
  processPayment: async (
    req: PaymentGatewayRequest,
    simulateOutcome: 'success' | 'failed' | 'cancelled' = 'success'
  ): Promise<PaymentGatewayResponse> => {
    await delay(1000); // Simulate network gateway roundtrip

    if (simulateOutcome === 'cancelled') {
      return {
        success: false,
        status: 'cancelled',
        errorMessage: 'Payment was cancelled by the user.',
      };
    }

    if (simulateOutcome === 'failed') {
      return {
        success: false,
        status: 'failed',
        errorMessage: 'Transaction declined by bank/gateway. Please check card or UPI credentials.',
      };
    }

    // Success branch
    const txnRef = `CF-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      billId: req.billId,
      orderId: req.orderId,
      tableNumber: req.tableNumber,
      amount: req.amount,
      method: req.method,
      status: 'completed',
      transactionRef: txnRef,
      createdAt: new Date().toISOString(),
    };

    paymentsState.unshift(newPayment);

    // Synchronize Bill status to paid upon verified gateway success
    await billsApi.updateBillStatus(req.billId, 'paid', req.amount);

    return {
      success: true,
      status: 'successful',
      transactionRef: txnRef,
      payment: newPayment,
    };
  },
};

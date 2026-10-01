import { initialPaymentsData } from '../../mock/payments';
import { PaymentTransaction, PaymentMethod, PaymentStatus } from '../../types/payment';
import { billsApi } from './bills';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let paymentsState: PaymentTransaction[] = [...initialPaymentsData];

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
  payment?: PaymentTransaction;
  errorMessage?: string;
}

export const paymentsApi = {
  getPayments: async (): Promise<PaymentTransaction[]> => {
    await delay();
    return [...paymentsState];
  },

  getPaymentById: async (id: string): Promise<PaymentTransaction | null> => {
    await delay();
    const p = paymentsState.find((x) => x.id === id);
    return p ? { ...p } : null;
  },

  updatePaymentStatus: async (id: string, status: PaymentStatus): Promise<PaymentTransaction> => {
    await delay();
    const index = paymentsState.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const updated = {
      ...paymentsState[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    paymentsState[index] = updated;

    // Sync bill status if marked SUCCESS or REFUNDED
    if (status === 'SUCCESS' || status === 'success') {
      await billsApi.updateBillStatus(updated.billId, 'paid', updated.amount, updated.method);
    } else if (status === 'REFUNDED' || status === 'refunded') {
      await billsApi.updateBillStatus(updated.billId, 'unpaid', 0, updated.method);
    }

    return updated;
  },

  refundPayment: async (id: string, refundAmount?: number, reason?: string): Promise<PaymentTransaction> => {
    await delay(300);
    const index = paymentsState.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Transaction not found');

    const updated: PaymentTransaction = {
      ...paymentsState[index],
      status: 'REFUNDED',
      errorMessage: reason ? `Refund Reason: ${reason}` : 'Refund processed by Admin',
      updatedAt: new Date().toISOString(),
    };
    paymentsState[index] = updated;

    await billsApi.updateBillStatus(updated.billId, 'unpaid', 0, updated.method);
    return updated;
  },

  /**
   * Process payment (Online or Counter).
   */
  processPayment: async (
    req: PaymentGatewayRequest,
    simulateOutcome: 'success' | 'failed' | 'cancelled' = 'success'
  ): Promise<PaymentGatewayResponse> => {
    await delay(400);

    if (simulateOutcome === 'cancelled') {
      return {
        success: false,
        status: 'CANCELLED',
        errorMessage: 'Payment was cancelled by the user.',
      };
    }

    if (simulateOutcome === 'failed') {
      return {
        success: false,
        status: 'FAILED',
        errorMessage: 'Transaction declined by bank/gateway. Please check card or UPI credentials.',
      };
    }

    const txnRef = `CF-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      transactionRef: txnRef,
      billId: req.billId,
      billNumber: `INV-${Date.now().toString().slice(-6)}`,
      orderId: req.orderId,
      tableNumber: req.tableNumber,
      customerName: req.customerName || 'Dining Guest',
      amount: req.amount,
      method: req.method,
      status: 'SUCCESS',
      gatewayName: 'Cashfree Payment Gateway Adapter',
      gatewayOrderId: `order_cf_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    paymentsState.unshift(newPayment);

    // Synchronize Bill status to paid upon verified gateway success
    await billsApi.updateBillStatus(req.billId, 'paid', req.amount, req.method);

    return {
      success: true,
      status: 'SUCCESS',
      transactionRef: txnRef,
      payment: newPayment,
    };
  },
};

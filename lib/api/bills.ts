import { initialBillsData } from '../../mock/bills';
import { Bill, BillStatus, BillItem } from '../../types/bill';
import { ordersApi } from './orders';
import { Order } from '../../types/order';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let billsState: Bill[] = [...initialBillsData];

export const billsApi = {
  getBills: async (): Promise<Bill[]> => {
    await delay();
    return [...billsState];
  },

  getBillById: async (id: string): Promise<Bill | null> => {
    await delay();
    const bill = billsState.find((b) => b.id === id);
    return bill ? { ...bill } : null;
  },

  getBillByOrderId: async (orderId: string): Promise<Bill | null> => {
    await delay();
    const bill = billsState.find((b) => b.orderId === orderId);
    return bill ? { ...bill } : null;
  },

  createBill: async (billData: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>): Promise<Bill> => {
    await delay();
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber: `INV-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    billsState.unshift(newBill);
    return newBill;
  },

  getSessionBill: async (
    tableId: string,
    tableNumber: number,
    customerName: string = 'Guest'
  ): Promise<Bill> => {
    await delay();
    const existing = billsState.find((b) => b.tableNumber === tableNumber && (b.status === 'unpaid' || b.status === 'UNPAID'));
    if (existing) return { ...existing };
    return billsApi.generateBillForTable(tableNumber, customerName);
  },

  /**
   * Aggregates all orders from a table/dining session into a single unified Bill.
   */
  generateBillForTable: async (
    tableNumber: number,
    customerName: string = 'Dining Guest',
    discountAmount: number = 0,
    tipAmount: number = 0
  ): Promise<Bill> => {
    await delay();

    const orders = await ordersApi.getOrdersByTable(tableNumber);
    const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected');

    const items: BillItem[] = [];
    let subtotal = 0;

    validOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        subtotal += item.totalPrice;
        items.push({
          id: `bi-${item.id}`,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.unitPrice,
          total: item.totalPrice,
          notes: item.specialInstructions,
        });
      });
    });

    if (items.length === 0) {
      // Fallback sample items if no orders found
      items.push(
        { id: 'bi-1', name: 'Truffle Mushroom Risotto', quantity: 2, price: 18.99, total: 37.98 },
        { id: 'bi-2', name: 'Artisan Garlic Bread', quantity: 1, price: 6.50, total: 6.50 }
      );
      subtotal = 44.48;
    }

    const taxAmount = Number((subtotal * 0.05).toFixed(2));
    const serviceCharge = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount + serviceCharge - discountAmount + tipAmount).toFixed(2));

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      billNumber: `INV-${Date.now().toString().slice(-6)}`,
      tableNumber,
      customerName,
      items,
      subtotal,
      taxAmount,
      serviceCharge,
      discountAmount,
      tipAmount,
      totalAmount,
      status: 'UNPAID',
      paidAmount: 0,
      remainingAmount: totalAmount,
      createdAt: new Date().toISOString(),
    };

    billsState.unshift(newBill);
    return newBill;
  },

  updateBillStatus: async (
    id: string,
    status: BillStatus,
    paidAmount?: number,
    paymentMethod?: string
  ): Promise<Bill> => {
    await delay();
    const index = billsState.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Bill not found');

    const total = billsState[index].totalAmount;
    const isPaid = status.toUpperCase() === 'PAID';

    const newPaidAmount =
      paidAmount !== undefined ? paidAmount : isPaid ? total : billsState[index].paidAmount;
    const remainingAmount = Math.max(0, total - newPaidAmount);

    const updated: Bill = {
      ...billsState[index],
      status,
      paidAmount: newPaidAmount,
      remainingAmount,
      paymentMethod: paymentMethod || billsState[index].paymentMethod || 'Cash / Counter',
      updatedAt: new Date().toISOString(),
    };
    billsState[index] = updated;
    return updated;
  },
};

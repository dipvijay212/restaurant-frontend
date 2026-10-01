import { Bill } from '../types/bill';

export const initialBillsData: Bill[] = [
  {
    id: 'bill-101',
    billNumber: 'INV-2026-001',
    orderId: 'ord-101',
    tableNumber: 1,
    customerName: 'Sarah Jenkins',
    items: [
      { id: 'bi-1', name: 'Truffle & Burrata Crostini', quantity: 1, price: 16.50, total: 16.50 },
      { id: 'bi-2', name: 'Prime Ribeye Steak (12oz)', quantity: 1, price: 44.00, total: 44.00 }
    ],
    subtotal: 60.50,
    taxAmount: 5.14,
    serviceCharge: 3.03,
    discountAmount: 0,
    tipAmount: 10.00,
    totalAmount: 78.67,
    status: 'unpaid',
    paidAmount: 0,
    remainingAmount: 78.67,
    createdAt: '2026-10-01T13:48:00Z',
  },
  {
    id: 'bill-104',
    billNumber: 'INV-2026-004',
    orderId: 'ord-104',
    tableNumber: 10,
    customerName: 'Michael Chang',
    items: [
      { id: 'bi-3', name: 'Wild Mushroom Risotto', quantity: 1, price: 26.00, total: 26.00 }
    ],
    subtotal: 26.00,
    taxAmount: 2.21,
    serviceCharge: 1.30,
    discountAmount: 0,
    tipAmount: 5.00,
    totalAmount: 34.51,
    status: 'paid',
    paidAmount: 34.51,
    remainingAmount: 0,
    createdAt: '2026-10-01T13:30:00Z',
  }
];

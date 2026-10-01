import { Order } from '../types/order';
import { initialProductsData } from './products';

export const initialOrdersData: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#1001',
    tableId: 'tbl-01',
    tableNumber: 1,
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (415) 555-0192',
    orderType: 'dine-in',
    items: [
      {
        id: 'oi-1',
        menuItem: initialProductsData[0], // Truffle Crostini
        quantity: 1,
        unitPrice: 16.50,
        totalPrice: 16.50,
        status: 'served',
      },
      {
        id: 'oi-2',
        menuItem: initialProductsData[3], // Ribeye Steak
        quantity: 1,
        unitPrice: 44.00,
        totalPrice: 44.00,
        status: 'preparing',
        specialInstructions: 'Medium Rare, extra truffle fries please',
      },
    ],
    subtotal: 60.50,
    taxAmount: 5.14,
    serviceCharge: 3.03,
    totalAmount: 68.67,
    status: 'preparing',
    paymentStatus: 'unpaid',
    specialNotes: 'Anniversary dinner celebration',
    createdAt: '2026-10-01T13:48:00Z',
    updatedAt: '2026-10-01T13:52:00Z',
    estimatedTimeMinutes: 15,
  },
  {
    id: 'ord-102',
    orderNumber: '#1002',
    tableId: 'tbl-02',
    tableNumber: 2,
    customerName: 'David Miller',
    customerPhone: '+1 (415) 555-0144',
    orderType: 'dine-in',
    items: [
      {
        id: 'oi-3',
        menuItem: initialProductsData[6], // Margherita Pizza
        quantity: 2,
        unitPrice: 20.00,
        totalPrice: 40.00,
        status: 'ready',
      },
      {
        id: 'oi-4',
        menuItem: initialProductsData[9], // Old Fashioned
        quantity: 2,
        unitPrice: 17.00,
        totalPrice: 34.00,
        status: 'served',
      },
    ],
    subtotal: 74.00,
    taxAmount: 6.29,
    serviceCharge: 3.70,
    totalAmount: 83.99,
    status: 'ready',
    paymentStatus: 'unpaid',
    createdAt: '2026-10-01T14:12:00Z',
    updatedAt: '2026-10-01T14:24:00Z',
    estimatedTimeMinutes: 5,
  },
  {
    id: 'ord-103',
    orderNumber: '#1003',
    tableId: 'tbl-05',
    tableNumber: 5,
    customerName: 'Alex Rivera',
    orderType: 'dine-in',
    items: [
      {
        id: 'oi-5',
        menuItem: initialProductsData[1], // Calamari
        quantity: 1,
        unitPrice: 18.00,
        totalPrice: 18.00,
        status: 'pending',
      },
      {
        id: 'oi-6',
        menuItem: initialProductsData[7], // Diavola Pizza
        quantity: 1,
        unitPrice: 23.50,
        totalPrice: 23.50,
        status: 'pending',
      },
    ],
    subtotal: 41.50,
    taxAmount: 3.53,
    serviceCharge: 2.08,
    totalAmount: 47.11,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: '2026-10-01T14:22:00Z',
    updatedAt: '2026-10-01T14:22:00Z',
    estimatedTimeMinutes: 20,
  },
  {
    id: 'ord-104',
    orderNumber: '#1004',
    tableId: 'tbl-10',
    tableNumber: 10,
    customerName: 'Michael Chang',
    orderType: 'dine-in',
    items: [
      {
        id: 'oi-7',
        menuItem: initialProductsData[5], // Risotto
        quantity: 1,
        unitPrice: 26.00,
        totalPrice: 26.00,
        status: 'served',
      },
    ],
    subtotal: 26.00,
    taxAmount: 2.21,
    serviceCharge: 1.30,
    totalAmount: 29.51,
    status: 'served',
    paymentStatus: 'paid',
    createdAt: '2026-10-01T13:30:00Z',
    updatedAt: '2026-10-01T14:15:00Z',
  }
];

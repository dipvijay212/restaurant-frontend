import { ServiceRequest } from '../types/notification';

export const initialRequestsData: ServiceRequest[] = [
  {
    id: 'req-01',
    tableNumber: 3,
    tableId: 'tbl-03',
    customerName: 'Sarah Jenkins',
    type: 'water',
    message: 'Could we get a fresh bottle of sparkling water please?',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago (delayed!)
  },
  {
    id: 'req-02',
    tableNumber: 5,
    tableId: 'tbl-05',
    customerName: 'Alex Rivera',
    type: 'waiter',
    message: 'We would like to order additional drinks.',
    status: 'ACCEPTED',
    assignedStaffId: 'stf-04',
    assignedStaffName: 'Carlos Ruiz',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
  },
  {
    id: 'req-03',
    tableNumber: 8,
    tableId: 'tbl-08',
    customerName: 'Emma Watson',
    type: 'cutlery',
    message: 'Extra forks and dessert spoons for 3 guests.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 min ago
  },
  {
    id: 'req-04',
    tableNumber: 10,
    tableId: 'tbl-10',
    customerName: 'Michael Chang',
    type: 'bill',
    message: 'Ready for the bill, paying via credit card.',
    status: 'COMPLETED',
    assignedStaffId: 'stf-03',
    assignedStaffName: 'Emma Watson',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-05',
    tableNumber: 2,
    tableId: 'tbl-02',
    customerName: 'David Miller',
    type: 'napkins',
    message: 'Extra cloth napkins please.',
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
];

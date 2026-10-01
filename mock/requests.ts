import { ServiceRequest } from '../types/notification';

export const initialRequestsData: ServiceRequest[] = [
  {
    id: 'req-01',
    tableNumber: 1,
    tableId: 'tbl-01',
    customerName: 'Sarah Jenkins',
    type: 'water',
    message: 'Could we get a bottle of sparkling water please?',
    status: 'pending',
    createdAt: '2026-10-01T14:32:00Z',
  },
  {
    id: 'req-02',
    tableNumber: 5,
    tableId: 'tbl-05',
    customerName: 'Alex Rivera',
    type: 'waiter',
    message: 'We would like to order additional drinks.',
    status: 'in_progress',
    assignedStaffId: 'stf-04',
    assignedStaffName: 'Carlos Ruiz',
    createdAt: '2026-10-01T14:28:00Z',
  },
  {
    id: 'req-03',
    tableNumber: 10,
    tableId: 'tbl-10',
    customerName: 'Michael Chang',
    type: 'bill',
    message: 'Ready for the bill, paying via card.',
    status: 'fulfilled',
    assignedStaffId: 'stf-03',
    assignedStaffName: 'Emma Watson',
    createdAt: '2026-10-01T14:15:00Z',
  },
  {
    id: 'req-04',
    tableNumber: 7,
    tableId: 'tbl-07',
    type: 'cleaning',
    message: 'Table needs cleaning for next guest.',
    status: 'pending',
    createdAt: '2026-10-01T14:35:00Z',
  }
];

export type RequestType = 'waiter' | 'water' | 'cutlery' | 'napkins' | 'bill' | 'other' | 'custom' | 'cleaning';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'pending' | 'accepted' | 'completed' | 'in_progress' | 'fulfilled' | 'cancelled';

export interface ServiceRequest {
  id: string;
  tableNumber: number;
  tableId: string;
  sessionId?: string;
  customerName?: string;
  type: RequestType;
  message?: string;
  status: RequestStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: string;
  read: boolean;
  orderId?: string;
  tableId?: string;
}

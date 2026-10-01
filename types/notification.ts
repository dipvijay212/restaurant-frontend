export type RequestType =
  | 'waiter'
  | 'water'
  | 'cutlery'
  | 'napkins'
  | 'napkin'
  | 'bill'
  | 'other'
  | 'custom'
  | 'cleaning'
  | 'WAITER'
  | 'WATER'
  | 'CUTLERY'
  | 'NAPKIN'
  | 'BILL'
  | 'OTHER';

export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'in_progress'
  | 'fulfilled';

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

export type NotificationAudience = 'admin_staff' | 'customer' | 'all';

export type AdminStaffNotificationCategory =
  | 'new_order'
  | 'customer_request'
  | 'bill_request'
  | 'delayed_order'
  | 'payment_received';

export type CustomerNotificationCategory =
  | 'order_accepted'
  | 'order_preparing'
  | 'order_ready'
  | 'order_served'
  | 'bill_ready'
  | 'payment_result';

export type NotificationCategory =
  | AdminStaffNotificationCategory
  | CustomerNotificationCategory
  | 'general';

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  category?: NotificationCategory;
  audience?: NotificationAudience;
  timestamp: string;
  read: boolean;
  orderId?: string;
  tableId?: string;
  tableNumber?: number;
  billId?: string;
  paymentId?: string;
  requestId?: string;
  amount?: number;
  metadata?: Record<string, any>;
}

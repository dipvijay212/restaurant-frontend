import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemAlert, NotificationAudience } from '../../types/notification';

interface NotificationsState {
  notifications: SystemAlert[];
  unreadCount: number;
  soundEnabled: boolean;
}

const initialNotifications: SystemAlert[] = [
  // Admin / Staff Notifications
  {
    id: 'notif-1',
    title: 'New Order Received',
    message: 'Table #4 placed Order #1042 (2 items - $42.00).',
    type: 'info',
    category: 'new_order',
    audience: 'admin_staff',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    read: false,
    orderId: 'ord-1042',
    tableNumber: 4,
  },
  {
    id: 'notif-2',
    title: 'Customer Service Request',
    message: 'Table #2 requested extra cutlery and water refill.',
    type: 'warning',
    category: 'customer_request',
    audience: 'admin_staff',
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    read: false,
    tableNumber: 2,
  },
  {
    id: 'notif-3',
    title: 'Bill Requested',
    message: 'Table #7 requested bill generation ($124.50).',
    type: 'info',
    category: 'bill_request',
    audience: 'admin_staff',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: true,
    tableNumber: 7,
    amount: 124.5,
  },
  {
    id: 'notif-4',
    title: 'Delayed Order Warning',
    message: 'Order #1038 (Table #1) has exceeded the 25-min preparation threshold.',
    type: 'alert',
    category: 'delayed_order',
    audience: 'admin_staff',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: false,
    orderId: 'ord-1038',
    tableNumber: 1,
  },
  {
    id: 'notif-5',
    title: 'Payment Received',
    message: 'Payment of $84.50 received via UPI for Table #3 (TXN: TXN-892341).',
    type: 'success',
    category: 'payment_received',
    audience: 'admin_staff',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    read: true,
    tableNumber: 3,
    amount: 84.5,
  },

  // Customer Notifications
  {
    id: 'notif-cust-1',
    title: 'Order Accepted',
    message: 'Your order #1042 has been confirmed by the kitchen!',
    type: 'info',
    category: 'order_accepted',
    audience: 'customer',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    orderId: 'ord-1042',
  },
  {
    id: 'notif-cust-2',
    title: 'Order Preparing',
    message: 'Chef started crafting your Wood-Fired Margherita Pizza.',
    type: 'info',
    category: 'order_preparing',
    audience: 'customer',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    orderId: 'ord-1042',
  },
  {
    id: 'notif-cust-3',
    title: 'Food Ready!',
    message: 'Order #1042 is piping hot and ready for delivery.',
    type: 'success',
    category: 'order_ready',
    audience: 'customer',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: true,
    orderId: 'ord-1042',
  },
  {
    id: 'notif-cust-4',
    title: 'Order Served',
    message: 'Order #1042 has been served to your table. Enjoy your meal!',
    type: 'success',
    category: 'order_served',
    audience: 'customer',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    read: true,
    orderId: 'ord-1042',
  },
  {
    id: 'notif-cust-5',
    title: 'Bill Ready',
    message: 'Your total bill of $42.00 is ready for settlement.',
    type: 'info',
    category: 'bill_ready',
    audience: 'customer',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: true,
    amount: 42.0,
  },
  {
    id: 'notif-cust-6',
    title: 'Payment Completed',
    message: 'Thank you! Payment of $42.00 successful via Online PG.',
    type: 'success',
    category: 'payment_result',
    audience: 'customer',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
    amount: 42.0,
  },
];

const initialState: NotificationsState = {
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.read).length,
  soundEnabled: true,
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<SystemAlert[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    addNotification: (state, action: PayloadAction<SystemAlert>) => {
      const payloadWithDefaults: SystemAlert = {
        ...action.payload,
        category: action.payload.category || 'general',
        audience: action.payload.audience || 'all',
      };
      // Prevent exact duplicates by ID
      const exists = state.notifications.some((n) => n.id === payloadWithDefaults.id);
      if (!exists) {
        state.notifications.unshift(payloadWithDefaults);
        if (!payloadWithDefaults.read) {
          state.unreadCount += 1;
        }
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload);
      if (index > -1 && !state.notifications[index].read) {
        state.notifications[index].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state, action: PayloadAction<NotificationAudience | undefined>) => {
      const targetAudience = action.payload;
      state.notifications = state.notifications.map((n) => {
        if (!targetAudience || targetAudience === 'all' || n.audience === targetAudience || n.audience === 'all') {
          return { ...n, read: true };
        }
        return n;
      });
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload);
      if (index > -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    clearNotifications: (state, action: PayloadAction<NotificationAudience | undefined>) => {
      const targetAudience = action.payload;
      if (!targetAudience || targetAudience === 'all') {
        state.notifications = [];
        state.unreadCount = 0;
      } else {
        state.notifications = state.notifications.filter((n) => n.audience !== targetAudience);
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      }
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  toggleSound,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

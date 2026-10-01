import { store } from '../../store';
import { addNotification } from '../../store/slices/notificationsSlice';
import { SystemAlert, NotificationCategory, NotificationAudience } from '../../types/notification';
import { socketClient, SOCKET_EVENTS } from './socketClient';
import { playNotificationSound } from '../utils/sound';

export function initializeNotificationSocketListeners() {
  // Handler helper to bind socket events to Redux & Audio alerts
  const handleIncomingSocketNotification = (payload: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success';
    category: NotificationCategory;
    audience: NotificationAudience;
    orderId?: string;
    tableNumber?: number;
    amount?: number;
    metadata?: Record<string, any>;
  }) => {
    const alert: SystemAlert = {
      id: `notif-socket-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      category: payload.category,
      audience: payload.audience,
      timestamp: new Date().toISOString(),
      read: false,
      orderId: payload.orderId,
      tableNumber: payload.tableNumber,
      amount: payload.amount,
      metadata: payload.metadata,
    };

    // Dispatch to Redux store
    store.dispatch(addNotification(alert));

    // Play chime if sound enabled in Redux state
    const soundEnabled = store.getState().notifications.soundEnabled;
    if (soundEnabled) {
      if (payload.category === 'new_order') {
        playNotificationSound('new_order');
      } else if (payload.category === 'delayed_order') {
        playNotificationSound('delayed');
      } else if (payload.category === 'customer_request') {
        playNotificationSound('request');
      } else if (payload.category === 'bill_request') {
        playNotificationSound('bill');
      } else if (payload.category === 'payment_received' || payload.category === 'payment_result') {
        playNotificationSound('payment');
      } else {
        playNotificationSound('status_change');
      }
    }
  };

  // Subscribe Admin/Staff Events
  socketClient.on(SOCKET_EVENTS.NEW_ORDER, (data) => {
    handleIncomingSocketNotification({
      title: 'New Order Received',
      message: data.message || `Table #${data.tableNumber || 1} placed a new order #${data.orderId || '1043'}.`,
      type: 'info',
      category: 'new_order',
      audience: 'admin_staff',
      orderId: data.orderId,
      tableNumber: data.tableNumber,
      amount: data.amount,
    });
  });

  socketClient.on(SOCKET_EVENTS.CUSTOMER_REQUEST, (data) => {
    handleIncomingSocketNotification({
      title: 'Customer Service Request',
      message: data.message || `Table #${data.tableNumber || 1} requested assistance.`,
      type: 'warning',
      category: 'customer_request',
      audience: 'admin_staff',
      tableNumber: data.tableNumber,
    });
  });

  socketClient.on(SOCKET_EVENTS.BILL_REQUEST, (data) => {
    handleIncomingSocketNotification({
      title: 'Bill Request',
      message: data.message || `Table #${data.tableNumber || 1} requested final bill statement.`,
      type: 'info',
      category: 'bill_request',
      audience: 'admin_staff',
      tableNumber: data.tableNumber,
      amount: data.amount,
    });
  });

  socketClient.on(SOCKET_EVENTS.DELAYED_ORDER, (data) => {
    handleIncomingSocketNotification({
      title: 'Delayed Order Warning',
      message: data.message || `Order #${data.orderId || '1038'} is exceeding prep target.`,
      type: 'alert',
      category: 'delayed_order',
      audience: 'admin_staff',
      orderId: data.orderId,
      tableNumber: data.tableNumber,
    });
  });

  socketClient.on(SOCKET_EVENTS.PAYMENT_RECEIVED, (data) => {
    handleIncomingSocketNotification({
      title: 'Payment Received',
      message: data.message || `Payment of $${data.amount || '0.00'} received for Table #${data.tableNumber || 1}.`,
      type: 'success',
      category: 'payment_received',
      audience: 'admin_staff',
      tableNumber: data.tableNumber,
      amount: data.amount,
    });
  });

  // Subscribe Customer Events
  socketClient.on(SOCKET_EVENTS.ORDER_ACCEPTED, (data) => {
    handleIncomingSocketNotification({
      title: 'Order Accepted',
      message: data.message || `Kitchen accepted your order #${data.orderId || '1042'}.`,
      type: 'info',
      category: 'order_accepted',
      audience: 'customer',
      orderId: data.orderId,
    });
  });

  socketClient.on(SOCKET_EVENTS.ORDER_PREPARING, (data) => {
    handleIncomingSocketNotification({
      title: 'Order Preparing',
      message: data.message || `Chef is now preparing your delicious meal!`,
      type: 'info',
      category: 'order_preparing',
      audience: 'customer',
      orderId: data.orderId,
    });
  });

  socketClient.on(SOCKET_EVENTS.ORDER_READY, (data) => {
    handleIncomingSocketNotification({
      title: 'Food Ready!',
      message: data.message || `Order #${data.orderId || '1042'} is ready to serve!`,
      type: 'success',
      category: 'order_ready',
      audience: 'customer',
      orderId: data.orderId,
    });
  });

  socketClient.on(SOCKET_EVENTS.ORDER_SERVED, (data) => {
    handleIncomingSocketNotification({
      title: 'Order Served',
      message: data.message || `Order #${data.orderId || '1042'} served to your table. Enjoy!`,
      type: 'success',
      category: 'order_served',
      audience: 'customer',
      orderId: data.orderId,
    });
  });

  socketClient.on(SOCKET_EVENTS.BILL_READY, (data) => {
    handleIncomingSocketNotification({
      title: 'Bill Ready',
      message: data.message || `Your final bill total is $${data.amount || '0.00'}.`,
      type: 'info',
      category: 'bill_ready',
      audience: 'customer',
      amount: data.amount,
    });
  });

  socketClient.on(SOCKET_EVENTS.PAYMENT_RESULT, (data) => {
    handleIncomingSocketNotification({
      title: 'Payment Successful',
      message: data.message || `Payment completed. Thank you for dining with us!`,
      type: 'success',
      category: 'payment_result',
      audience: 'customer',
      amount: data.amount,
    });
  });
}

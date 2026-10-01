import { socketClient, SOCKET_EVENTS } from './socketClient';
import { NotificationCategory } from '../../types/notification';

export const mockNotificationEmitter = {
  // Admin / Staff Notifications
  emitNewOrder: (tableNumber = 5, orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000), amount = 48.50) => {
    socketClient.emit(SOCKET_EVENTS.NEW_ORDER, {
      tableNumber,
      orderId,
      amount,
      message: `Table #${tableNumber} submitted new Order #${orderId} ($${amount.toFixed(2)}).`,
    });
  },

  emitCustomerRequest: (tableNumber = 3, requestType = 'Water Refill') => {
    socketClient.emit(SOCKET_EVENTS.CUSTOMER_REQUEST, {
      tableNumber,
      message: `Table #${tableNumber} requested ${requestType}.`,
    });
  },

  emitBillRequest: (tableNumber = 7, amount = 112.00) => {
    socketClient.emit(SOCKET_EVENTS.BILL_REQUEST, {
      tableNumber,
      amount,
      message: `Table #${tableNumber} requested digital bill printout ($${amount.toFixed(2)}).`,
    });
  },

  emitDelayedOrder: (tableNumber = 1, orderId = 'ORD-1038') => {
    socketClient.emit(SOCKET_EVENTS.DELAYED_ORDER, {
      tableNumber,
      orderId,
      message: `Order #${orderId} (Table #${tableNumber}) exceeded 25m preparation warning threshold.`,
    });
  },

  emitPaymentReceived: (tableNumber = 4, amount = 64.00) => {
    socketClient.emit(SOCKET_EVENTS.PAYMENT_RECEIVED, {
      tableNumber,
      amount,
      message: `Payment of $${amount.toFixed(2)} received via Cashfree for Table #${tableNumber}.`,
    });
  },

  // Customer Notifications
  emitOrderAccepted: (orderId = 'ORD-1042') => {
    socketClient.emit(SOCKET_EVENTS.ORDER_ACCEPTED, {
      orderId,
      message: `Your order #${orderId} has been accepted and dispatched to chef.`,
    });
  },

  emitOrderPreparing: (orderId = 'ORD-1042') => {
    socketClient.emit(SOCKET_EVENTS.ORDER_PREPARING, {
      orderId,
      message: `Chef is currently preparing your meal on station 2.`,
    });
  },

  emitOrderReady: (orderId = 'ORD-1042') => {
    socketClient.emit(SOCKET_EVENTS.ORDER_READY, {
      orderId,
      message: `Order #${orderId} is fresh, hot, and ready for pickup!`,
    });
  },

  emitOrderServed: (orderId = 'ORD-1042') => {
    socketClient.emit(SOCKET_EVENTS.ORDER_SERVED, {
      orderId,
      message: `Order #${orderId} has been served to your table. Bon appetit!`,
    });
  },

  emitBillReady: (amount = 48.50) => {
    socketClient.emit(SOCKET_EVENTS.BILL_READY, {
      amount,
      message: `Your session bill of $${amount.toFixed(2)} is ready for settlement.`,
    });
  },

  emitPaymentResult: (amount = 48.50, success = true) => {
    socketClient.emit(SOCKET_EVENTS.PAYMENT_RESULT, {
      amount,
      success,
      message: success 
        ? `Payment of $${amount.toFixed(2)} processed successfully!`
        : `Payment failed. Please retry at counter.`,
    });
  },

  // Helper to trigger any category by name
  triggerCategory: (category: NotificationCategory) => {
    switch (category) {
      case 'new_order':
        mockNotificationEmitter.emitNewOrder();
        break;
      case 'customer_request':
        mockNotificationEmitter.emitCustomerRequest();
        break;
      case 'bill_request':
        mockNotificationEmitter.emitBillRequest();
        break;
      case 'delayed_order':
        mockNotificationEmitter.emitDelayedOrder();
        break;
      case 'payment_received':
        mockNotificationEmitter.emitPaymentReceived();
        break;
      case 'order_accepted':
        mockNotificationEmitter.emitOrderAccepted();
        break;
      case 'order_preparing':
        mockNotificationEmitter.emitOrderPreparing();
        break;
      case 'order_ready':
        mockNotificationEmitter.emitOrderReady();
        break;
      case 'order_served':
        mockNotificationEmitter.emitOrderServed();
        break;
      case 'bill_ready':
        mockNotificationEmitter.emitBillReady();
        break;
      case 'payment_result':
        mockNotificationEmitter.emitPaymentResult();
        break;
      default:
        mockNotificationEmitter.emitNewOrder();
        break;
    }
  },
};

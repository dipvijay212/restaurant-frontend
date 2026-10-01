import { initialOrdersData } from '../../mock/orders';
import { Order, OrderStatus, OrderPaymentStatus } from '../../types/order';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let ordersState: Order[] = [...initialOrdersData];

export const ordersApi = {
  getOrders: async (status?: OrderStatus): Promise<Order[]> => {
    await delay();
    if (status) {
      return ordersState.filter((o) => o.status === status);
    }
    return [...ordersState];
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    await delay();
    const order = ordersState.find((o) => o.id === id);
    return order ? { ...order } : null;
  },

  getOrdersByTable: async (tableNumber: number): Promise<Order[]> => {
    await delay();
    return ordersState.filter((o) => o.tableNumber === tableNumber);
  },

  createOrder: async (newOrderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    await delay();
    const orderId = `ord-${Date.now()}`;
    const orderNum = `#${1000 + ordersState.length + 1}`;
    const newOrder: Order = {
      ...newOrderData,
      id: orderId,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ordersState.unshift(newOrder);
    return newOrder;
  },

  updateOrderStatus: async (id: string, status: OrderStatus, note?: string): Promise<Order> => {
    await delay();
    const index = ordersState.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const history = ordersState[index].statusHistory
      ? [...ordersState[index].statusHistory!]
      : [
          {
            status: ordersState[index].status,
            timestamp: ordersState[index].createdAt,
            note: 'Order created',
          },
        ];

    history.unshift({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status.toUpperCase()}`,
    });

    const updatedOrder: Order = {
      ...ordersState[index],
      status,
      statusHistory: history,
      updatedAt: new Date().toISOString(),
    };
    ordersState[index] = updatedOrder;
    return updatedOrder;
  },

  updatePaymentStatus: async (id: string, paymentStatus: OrderPaymentStatus): Promise<Order> => {
    await delay();
    const index = ordersState.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Order not found');

    const updatedOrder: Order = {
      ...ordersState[index],
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    ordersState[index] = updatedOrder;
    return updatedOrder;
  },

  updateOrderItemStatus: async (orderId: string, itemId: string, itemStatus: OrderStatus): Promise<Order> => {
    await delay();
    const index = ordersState.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const updatedItems = ordersState[index].items.map((item) =>
      item.id === itemId ? { ...item, status: itemStatus } : item
    );

    const updatedOrder: Order = {
      ...ordersState[index],
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    };
    ordersState[index] = updatedOrder;
    return updatedOrder;
  },
};

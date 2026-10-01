import { Order, OrderStatus } from '../../types/order';

type OrderListener = (updatedOrder: Order) => void;

class MockOrderSocketService {
  private listeners: Map<string, Set<OrderListener>> = new Map();
  private globalListeners: Set<OrderListener> = new Set();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Subscribe to real-time status updates for a specific order.
   */
  subscribe(orderId: string, callback: OrderListener): () => void {
    if (!this.listeners.has(orderId)) {
      this.listeners.set(orderId, new Set());
    }
    this.listeners.get(orderId)!.add(callback);

    return () => {
      const set = this.listeners.get(orderId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(orderId);
          this.stopSimulation(orderId);
        }
      }
    };
  }

  /**
   * Subscribe to ALL order updates (useful for KDS board and Admin live feed).
   */
  subscribeAll(callback: OrderListener): () => void {
    this.globalListeners.add(callback);
    return () => {
      this.globalListeners.delete(callback);
    };
  }

  /**
   * Emit an updated order to all subscribed listeners.
   */
  emitOrderUpdate(order: Order) {
    const set = this.listeners.get(order.id);
    if (set) {
      set.forEach((cb) => cb({ ...order }));
    }
    this.globalListeners.forEach((cb) => cb({ ...order }));
  }

  /**
   * Simulate realistic kitchen progress progression over time:
   * pending -> accepted (5s) -> preparing (12s) -> ready (25s)
   */
  startSimulation(initialOrder: Order) {
    if (this.timers.has(initialOrder.id)) return;

    let currentOrder = { ...initialOrder };

    const steps: { nextStatus: OrderStatus; delayMs: number }[] = [
      { nextStatus: 'accepted', delayMs: 5000 },
      { nextStatus: 'preparing', delayMs: 12000 },
      { nextStatus: 'ready', delayMs: 25000 },
    ];

    let stepIdx = 0;

    const runNextStep = () => {
      if (stepIdx >= steps.length) return;
      const step = steps[stepIdx];

      const timer = setTimeout(() => {
        currentOrder = {
          ...currentOrder,
          status: step.nextStatus,
          updatedAt: new Date().toISOString(),
        };
        this.emitOrderUpdate(currentOrder);
        stepIdx++;
        runNextStep();
      }, step.delayMs);

      this.timers.set(initialOrder.id, timer);
    };

    runNextStep();
  }

  stopSimulation(orderId: string) {
    if (this.timers.has(orderId)) {
      clearTimeout(this.timers.get(orderId));
      this.timers.delete(orderId);
    }
  }
}

export const orderSocketService = new MockOrderSocketService();


/**
 * Socket.IO Client Adapter Architecture
 * Prepares the application for real-time WebSocket / Socket.IO communication with backend.
 */

export const SOCKET_EVENTS = {
  // Connection / Room Events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',

  // Admin & Staff Notifications
  NEW_ORDER: 'order:new',
  CUSTOMER_REQUEST: 'request:new',
  BILL_REQUEST: 'bill:request',
  DELAYED_ORDER: 'order:delayed',
  PAYMENT_RECEIVED: 'payment:received',

  // Customer Notifications
  ORDER_ACCEPTED: 'order:accepted',
  ORDER_PREPARING: 'order:preparing',
  ORDER_READY: 'order:ready',
  ORDER_SERVED: 'order:served',
  BILL_READY: 'bill:ready',
  PAYMENT_RESULT: 'payment:result',
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

type EventCallback = (data: any) => void;

class SocketClientHub {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private connected: boolean = true;
  private currentRooms: Set<string> = new Set(['admin', 'staff', 'kitchen']);

  constructor() {
    // Initialized in connected state for local event bus
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public joinRoom(room: string) {
    this.currentRooms.add(room);
    console.log(`[Socket.IO Client] Joined room: ${room}`);
  }

  public leaveRoom(room: string) {
    this.currentRooms.delete(room);
    console.log(`[Socket.IO Client] Left room: ${room}`);
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return cleanup unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  public off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  public emit(event: string, data: any) {
    console.log(`[Socket.IO Outbound] Event: ${event}`, data);
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }
}

export const socketClient = new SocketClientHub();

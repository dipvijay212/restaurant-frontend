import { SystemAlert } from '../../types/notification';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let notificationsState: SystemAlert[] = [
  {
    id: 'notif-1',
    title: 'New Service Request',
    message: 'Table 1 requested water.',
    type: 'info',
    timestamp: '2026-10-01T14:32:00Z',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Order Ready',
    message: 'Order #1002 for Table 2 is ready for serving.',
    type: 'success',
    timestamp: '2026-10-01T14:24:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'High Table Occupancy',
    message: 'Restaurant capacity has reached 75%.',
    type: 'warning',
    timestamp: '2026-10-01T14:00:00Z',
    read: true,
  },
];

export const notificationsApi = {
  getNotifications: async (): Promise<SystemAlert[]> => {
    await delay();
    return [...notificationsState];
  },

  markAsRead: async (id: string): Promise<SystemAlert> => {
    await delay();
    const index = notificationsState.findIndex((n) => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    notificationsState[index] = { ...notificationsState[index], read: true };
    return notificationsState[index];
  },

  markAllAsRead: async (): Promise<boolean> => {
    await delay();
    notificationsState = notificationsState.map((n) => ({ ...n, read: true }));
    return true;
  },
};

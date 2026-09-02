import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification } from '../types/notification';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getUnreadCount: (worldId?: string) => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      getUnreadCount: (worldId?: string) => {
        const { notifications } = get();
        return notifications.filter((n) => (!worldId || n.worldId === worldId) && !n.read).length;
      },
    }),
    {
      name: 'sniffer_notification_store_v1',
    }
  )
);

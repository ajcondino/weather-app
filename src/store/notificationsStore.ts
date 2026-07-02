import { scheduleWeatherAlerts } from '#/utils/notifications';
import { getItem, setItem } from '#/utils/storage';
import * as Notifications from 'expo-notifications';
import { create } from 'zustand';

interface NotificationsStore {
  enabled: boolean;
  hasPermission: boolean;
  load: () => Promise<void>;
  toggle: () => Promise<void>;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  enabled: false,
  hasPermission: false,

  load: async () => {
    // TODO: Centralize local storage keys
    const stored = await getItem<boolean>('notifications_enabled');
    const { status } = await Notifications.getPermissionsAsync();
    set({
      enabled: stored ?? false,
      hasPermission: status === 'granted',
    });
  },

  toggle: async () => {
    const { enabled, hasPermission } = get();

    if (!enabled) {
      // Turning on - request permission if we don't have it yet
      if (!hasPermission) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          // User denied - stay disabled, we can't update the store
          return;
        }
        set({ hasPermission: true });
      }
      set({ enabled: true });
      setItem('notifications_enabled', true);

      // TODO: This is just for testing, we should schedule based on actual weather alerts
      scheduleWeatherAlerts();
    } else {
      // Turning off - cancel all scheduled notifications
      set({ enabled: false });
      setItem('notifications_enabled', false);
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  },
}));

import { Location } from '#/api/types';
import i18n from '#/i18n';
import { getItem, setItem } from '#/utils/storage';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { create } from 'zustand';

export const MAX_SUBSCRIPTIONS = 2;

interface NotificationsStore {
  enabled: boolean;
  hasPermission: boolean;
  /** Keys of subscribed locations: `${lat},${lng}` */
  subscribedKeys: string[];
  /** Full location objects for subscribed locations */
  subscribedLocations: Location[];

  load: () => Promise<void>;
  toggle: () => Promise<void>;
  subscribeLocation: (location: Location) => void;
  unsubscribeLocation: (lat: number, lon: number) => void;
}

// Location key helper
export function locationKey(lat: number, lon: number): string {
  return `${lat},${lon}`;
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
  subscribedKeys: [],
  subscribedLocations: [],

  load: async () => {
    // TODO: Centralize local storage keys
    const storedEnabled = await getItem<boolean>('notifications_enabled');
    const storedLocations = await getItem<Location[]>('notification_subscriptions');
    const { status } = await Notifications.getPermissionsAsync();

    const locations = storedLocations ?? [];
    set({
      enabled: storedEnabled ?? false,
      hasPermission: status === 'granted',
      subscribedLocations: locations,
      subscribedKeys: locations.map((l) => locationKey(l.lat, l.lon)),
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
    } else {
      // Turning off - cancel all scheduled notifications
      set({ enabled: false });
      setItem('notifications_enabled', false);
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  },

  subscribeLocation: (location) => {
    const { subscribedKeys, subscribedLocations } = get();
    const key = locationKey(location.lat, location.lon);

    // Already subscribed - no op
    if (subscribedKeys.includes(key)) return;

    // Limit subscriptions
    if (subscribedKeys.length >= MAX_SUBSCRIPTIONS) {
      Alert.alert(
        i18n.t('notifications.subscriptionLimitTitle'),
        i18n.t('notifications.subscriptionLimitBody', { max: MAX_SUBSCRIPTIONS }),
      );
      return;
    }

    const updatedLocations = [...subscribedLocations, location];
    const updatedKeys = [...subscribedKeys, key];

    set({
      subscribedLocations: updatedLocations,
      subscribedKeys: updatedKeys,
    });
    setItem('notification_subscriptions', updatedLocations);
  },

  unsubscribeLocation: (lat, lon) => {
    const { subscribedKeys, subscribedLocations } = get();
    const key = locationKey(lat, lon);

    const updatedLocations = subscribedLocations.filter((l) => locationKey(l.lat, l.lon) !== key);
    const updatedKeys = subscribedKeys.filter((k) => k !== key);

    set({
      subscribedLocations: updatedLocations,
      subscribedKeys: updatedKeys,
    });
    setItem('notification_subscriptions', updatedLocations);
  },
}));

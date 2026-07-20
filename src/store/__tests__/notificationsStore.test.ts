import type { Location } from '#/api/types';
import i18n from '#/i18n';
import { useToastStore } from '#/store/toastStore';
import { getItem, setItem } from '#/utils/storage';
import * as Notifications from 'expo-notifications';
import { locationKey, useNotificationsStore } from '../notificationsStore';

jest.mock('#/utils/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

const mockGetItem = getItem as jest.Mock;
const mockSetItem = setItem as jest.Mock;
const mockGetPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissionsAsync = Notifications.requestPermissionsAsync as jest.Mock;
const mockCancelAllScheduledNotificationsAsync =
  Notifications.cancelAllScheduledNotificationsAsync as jest.Mock;

const makeLocation = (overrides: Partial<Location> = {}): Location =>
  ({
    lat: 14.5995,
    lon: 120.9842,
    name: 'Manila',
    ...overrides,
  }) as Location;

describe('useNotificationsStore', () => {
  beforeEach(() => {
    useNotificationsStore.setState({
      enabled: false,
      hasPermission: false,
      subscribedKeys: [],
      subscribedLocations: [],
    });
    useToastStore.setState({ message: null });
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockGetPermissionsAsync.mockReset();
    mockRequestPermissionsAsync.mockReset();
    mockCancelAllScheduledNotificationsAsync.mockReset();
  });

  describe('load', () => {
    it('populates state from storage and permission status', async () => {
      mockGetItem.mockImplementation((key: string) =>
        Promise.resolve(key === 'notifications_enabled' ? true : [makeLocation()]),
      );
      mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });

      await useNotificationsStore.getState().load();

      const state = useNotificationsStore.getState();
      expect(state.enabled).toBe(true);
      expect(state.hasPermission).toBe(true);
      expect(state.subscribedLocations).toEqual([makeLocation()]);
      expect(state.subscribedKeys).toEqual([locationKey(14.5995, 120.9842)]);
      expect(useToastStore.getState().message).toBeNull();
    });

    it('defaults hasPermission to false and shows a toast when the permission check throws', async () => {
      mockGetItem.mockResolvedValue(undefined);
      mockGetPermissionsAsync.mockRejectedValue(new Error('native failure'));

      await useNotificationsStore.getState().load();

      const state = useNotificationsStore.getState();
      expect(state.hasPermission).toBe(false);
      expect(state.enabled).toBe(false);
      expect(state.subscribedLocations).toEqual([]);
      expect(useToastStore.getState().message).toBe(i18n.t('errors.notificationsFailed'));
    });
  });

  describe('toggle', () => {
    it('turns on directly when permission is already granted', async () => {
      useNotificationsStore.setState({ hasPermission: true });

      await useNotificationsStore.getState().toggle();

      expect(useNotificationsStore.getState().enabled).toBe(true);
      expect(mockSetItem).toHaveBeenCalledWith('notifications_enabled', true);
      expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission and turns on when granted', async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

      await useNotificationsStore.getState().toggle();

      const state = useNotificationsStore.getState();
      expect(state.hasPermission).toBe(true);
      expect(state.enabled).toBe(true);
    });

    it('stays disabled when permission is denied', async () => {
      mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      await useNotificationsStore.getState().toggle();

      const state = useNotificationsStore.getState();
      expect(state.enabled).toBe(false);
      expect(state.hasPermission).toBe(false);
    });

    it('cancels scheduled notifications when turning off', async () => {
      useNotificationsStore.setState({ enabled: true, hasPermission: true });
      mockCancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);

      await useNotificationsStore.getState().toggle();

      expect(useNotificationsStore.getState().enabled).toBe(false);
      expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('shows a toast and leaves state unchanged when requesting permission throws', async () => {
      mockRequestPermissionsAsync.mockRejectedValue(new Error('native failure'));

      await useNotificationsStore.getState().toggle();

      expect(useNotificationsStore.getState().enabled).toBe(false);
      expect(useToastStore.getState().message).toBe(i18n.t('errors.notificationsFailed'));
    });

    it('shows a toast when cancelling scheduled notifications throws', async () => {
      useNotificationsStore.setState({ enabled: true, hasPermission: true });
      mockCancelAllScheduledNotificationsAsync.mockRejectedValue(new Error('native failure'));

      await useNotificationsStore.getState().toggle();

      expect(useToastStore.getState().message).toBe(i18n.t('errors.notificationsFailed'));
    });
  });
});

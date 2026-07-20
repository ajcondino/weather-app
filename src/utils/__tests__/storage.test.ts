import i18n from '#/i18n';
import { useToastStore } from '#/store/toastStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getItem, removeItem, setItem } from '../storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;
const mockRemoveItem = AsyncStorage.removeItem as jest.Mock;

describe('storage', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockRemoveItem.mockReset();
    useToastStore.setState({ message: null });
  });

  describe('getItem', () => {
    it('returns null without showing a toast when nothing is stored', async () => {
      mockGetItem.mockResolvedValue(null);

      const result = await getItem('some-key');

      expect(result).toBeNull();
      expect(useToastStore.getState().message).toBeNull();
    });

    it('parses and returns stored JSON', async () => {
      mockGetItem.mockResolvedValue(JSON.stringify({ a: 1 }));

      const result = await getItem('some-key');

      expect(result).toEqual({ a: 1 });
    });

    it('returns null and shows a toast when AsyncStorage throws', async () => {
      mockGetItem.mockRejectedValue(new Error('native failure'));

      const result = await getItem('some-key');

      expect(result).toBeNull();
      expect(useToastStore.getState().message).toBe(i18n.t('errors.loadFailed'));
    });

    it('returns null and shows a toast when stored JSON is corrupted', async () => {
      mockGetItem.mockResolvedValue('{not valid json');

      const result = await getItem('some-key');

      expect(result).toBeNull();
      expect(useToastStore.getState().message).toBe(i18n.t('errors.loadFailed'));
    });
  });

  describe('setItem', () => {
    it('writes the serialized value without showing a toast on success', async () => {
      mockSetItem.mockResolvedValue(undefined);

      await setItem('some-key', { a: 1 });

      expect(mockSetItem).toHaveBeenCalledWith('some-key', JSON.stringify({ a: 1 }));
      expect(useToastStore.getState().message).toBeNull();
    });

    it('shows a toast when AsyncStorage throws', async () => {
      mockSetItem.mockRejectedValue(new Error('native failure'));

      await setItem('some-key', { a: 1 });

      expect(useToastStore.getState().message).toBe(i18n.t('errors.persistFailed'));
    });
  });

  describe('removeItem', () => {
    it('does not show a toast on success', async () => {
      mockRemoveItem.mockResolvedValue(undefined);

      await removeItem('some-key');

      expect(useToastStore.getState().message).toBeNull();
    });

    it('shows a toast when AsyncStorage throws', async () => {
      mockRemoveItem.mockRejectedValue(new Error('native failure'));

      await removeItem('some-key');

      expect(useToastStore.getState().message).toBe(i18n.t('errors.persistFailed'));
    });
  });
});

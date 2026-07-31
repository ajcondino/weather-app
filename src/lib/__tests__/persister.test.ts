import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStoragePersister } from '../persister';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;
const mockRemoveItem = AsyncStorage.removeItem as jest.Mock;

const persistedClient = {
  clientState: { queries: [], mutations: [] },
  timestamp: 0,
  buster: '',
};

describe('asyncStoragePersister', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockRemoveItem.mockReset();
  });

  it('serializes and writes the client under the offline cache key', async () => {
    mockSetItem.mockResolvedValue(undefined);

    await asyncStoragePersister.persistClient(persistedClient);

    expect(mockSetItem).toHaveBeenCalledWith(
      'REACT_QUERY_OFFLINE_CACHE',
      JSON.stringify(persistedClient),
    );
  });

  it('reads and deserializes the client from the offline cache key', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(persistedClient));

    const restored = await asyncStoragePersister.restoreClient();

    expect(mockGetItem).toHaveBeenCalledWith('REACT_QUERY_OFFLINE_CACHE');
    expect(restored).toEqual(persistedClient);
  });

  it('returns undefined when nothing is stored', async () => {
    mockGetItem.mockResolvedValue(null);

    const restored = await asyncStoragePersister.restoreClient();

    expect(restored).toBeUndefined();
  });

  it('removes the offline cache key', async () => {
    mockRemoveItem.mockResolvedValue(undefined);

    await asyncStoragePersister.removeClient();

    expect(mockRemoveItem).toHaveBeenCalledWith('REACT_QUERY_OFFLINE_CACHE');
  });
});

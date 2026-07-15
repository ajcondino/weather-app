import type { Location } from '#/api/types';
import { getItem, setItem } from '#/utils/storage';
import { useSavedLocationsStore } from '../savedLocationsStore';

// Replace the real storage module with fake functions we control.
// Now `getItem`/`setItem` in the store code actually call our mocks.
jest.mock('#/utils/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = getItem as jest.Mock;
const mockSetItem = setItem as jest.Mock;

const makeLocation = (overrides: Partial<Location> = {}): Location =>
  ({
    lat: 14.5995,
    lon: 120.9842,
    name: 'Manila',
    ...overrides,
  }) as Location;

describe('useSavedLocationsStore', () => {
  beforeEach(() => {
    // Reset the store back to its initial state before every test
    useSavedLocationsStore.setState({ locations: [], isLoaded: false });
    // Clear mock call history (e.g. how many times setItem was called)
    mockGetItem.mockReset();
    mockSetItem.mockReset();
  });

  describe('load', () => {
    it('populates locations from storage', async () => {
      const saved = [makeLocation()];
      mockGetItem.mockResolvedValue(saved);

      await useSavedLocationsStore.getState().load();

      expect(useSavedLocationsStore.getState().locations).toEqual(saved);
      expect(useSavedLocationsStore.getState().isLoaded).toBe(true);
    });

    it('defaults to an empty array when nothing is stored', async () => {
      mockGetItem.mockResolvedValue(undefined);

      await useSavedLocationsStore.getState().load();

      expect(useSavedLocationsStore.getState().locations).toEqual([]);
      expect(useSavedLocationsStore.getState().isLoaded).toBe(true);
    });
  });

  describe('saveLocation', () => {
    it('adds a new location', () => {
      const loc = makeLocation();

      useSavedLocationsStore.getState().saveLocation(loc);

      expect(useSavedLocationsStore.getState().locations).toEqual([loc]);
    });

    it('persists to storage after saving', () => {
      const loc = makeLocation();

      useSavedLocationsStore.getState().saveLocation(loc);

      expect(mockSetItem).toHaveBeenCalledWith('favorited_locations', [loc]);
    });

    it('does not add a duplicate location', () => {
      const loc = makeLocation();

      useSavedLocationsStore.getState().saveLocation(loc);
      useSavedLocationsStore.getState().saveLocation(loc);

      expect(useSavedLocationsStore.getState().locations).toHaveLength(1);
    });

    it('treats numeric and string coordinates as the same location', () => {
      useSavedLocationsStore.getState().saveLocation(makeLocation({ lat: 14.5995, lon: 120.9842 }));
      // Simulates a value arriving from route params as a string
      useSavedLocationsStore.getState().saveLocation(
        makeLocation({
          lat: '14.5995' as unknown as number,
          lon: '120.9842' as unknown as number,
        }),
      );

      expect(useSavedLocationsStore.getState().locations).toHaveLength(1);
    });

    it('does not add more than MAX_LOCATIONS (10)', () => {
      for (let i = 0; i < 10; i++) {
        useSavedLocationsStore.getState().saveLocation(makeLocation({ lat: i, lon: i }));
      }
      // 11th location, should be rejected
      useSavedLocationsStore.getState().saveLocation(makeLocation({ lat: 999, lon: 999 }));

      expect(useSavedLocationsStore.getState().locations).toHaveLength(10);
    });
  });

  describe('removeLocation', () => {
    it('removes a matching location', () => {
      const loc = makeLocation();
      useSavedLocationsStore.setState({ locations: [loc] });

      useSavedLocationsStore.getState().removeLocation(loc.lat, loc.lon);

      expect(useSavedLocationsStore.getState().locations).toEqual([]);
    });

    it('persists to storage after removing', () => {
      const loc = makeLocation();
      useSavedLocationsStore.setState({ locations: [loc] });

      useSavedLocationsStore.getState().removeLocation(loc.lat, loc.lon);

      expect(mockSetItem).toHaveBeenCalledWith('favorited_locations', []);
    });

    it('leaves other locations untouched', () => {
      const a = makeLocation({ lat: 1, lon: 1 });
      const b = makeLocation({ lat: 2, lon: 2 });
      useSavedLocationsStore.setState({ locations: [a, b] });

      useSavedLocationsStore.getState().removeLocation(a.lat, a.lon);

      expect(useSavedLocationsStore.getState().locations).toEqual([b]);
    });
  });

  describe('isSaved', () => {
    it('returns true for a saved location', () => {
      const loc = makeLocation();
      useSavedLocationsStore.setState({ locations: [loc] });

      expect(useSavedLocationsStore.getState().isSaved(loc.lat, loc.lon)).toBe(true);
    });

    it('returns false for a location that is not saved', () => {
      expect(useSavedLocationsStore.getState().isSaved(0, 0)).toBe(false);
    });
  });
});

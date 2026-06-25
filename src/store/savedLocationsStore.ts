import { Location } from '#/api/types';
import { getItem, setItem } from '#/utils/storage';
import { create } from 'zustand';

const LOCATIONS_KEY = 'favorited_locations';
const MAX_LOCATIONS = 10;

interface SavedLocationStore {
  locations: Location[];
  isLoaded: boolean;
  load: () => Promise<void>;
  saveLocation: (loc: Location) => void;
  removeLocation: (lat: number, lon: number) => void;
  isSaved: (lat: number, lon: number) => boolean;
}

export const useSavedLocationsStore = create<SavedLocationStore>((set, get) => ({
  locations: [],
  isLoaded: false,

  load: async () => {
    const stored = await getItem<Location[]>(LOCATIONS_KEY);
    set({ locations: stored ?? [], isLoaded: true });
  },

  isSaved: (lat, lon) => {
    const { locations } = get();
    return locations.some(
      // Coordinates are stored as numbers but arrive from route params as
      // strings (e.g. "14.5995"). Number("14.5995") === 14.5995 is true,
      // but floating point precision can cause subtle mismatches if the
      // value is ever processed or serialized differently along the way
      // (e.g. 14.59950000001 !== 14.5995). Comparing as strings avoids
      // this entirely — same digits, same string, guaranteed match.
      (l) => String(l.lat) === String(lat) && String(l.lon) === String(lon),
    );
  },

  saveLocation: (loc) => {
    const { locations, isSaved } = get();

    if (isSaved(loc.lat, loc.lon) || locations.length >= MAX_LOCATIONS) return;

    const updated = [...locations, loc];
    set({ locations: updated });
    setItem(LOCATIONS_KEY, updated);
  },

  removeLocation: (lat, lon) => {
    const { locations } = get();
    const updated = locations.filter(
      // See isSaved() for why we compare as strings instead of numbers.
      (l) => !(String(l.lat) === String(lat) && String(l.lon) === String(lon)),
    );
    set({ locations: updated });
    setItem(LOCATIONS_KEY, updated);
  },
}));

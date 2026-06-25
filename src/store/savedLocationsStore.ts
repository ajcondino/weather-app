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
}

export const useSavedLocationsStore = create<SavedLocationStore>((set, get) => ({
  locations: [],
  isLoaded: false,

  load: async () => {
    const stored = await getItem<Location[]>(LOCATIONS_KEY);
    set({ locations: stored ?? [], isLoaded: true });
  },

  saveLocation: (loc) => {
    const { locations } = get();

    // Check duplicates
    const alreadySaved = locations.some((l) => l.lat === loc.lat && l.lon === loc.lon);
    if (alreadySaved || locations.length >= MAX_LOCATIONS) return;

    const updated = [...locations, loc];
    set({ locations: updated });
    setItem(LOCATIONS_KEY, updated);
  },

  removeLocation: (lat, lon) => {
    const { locations } = get();
    const updated = locations.filter((l) => !(l.lat === lat && l.lon === lon));
    set({ locations: updated });
    setItem(LOCATIONS_KEY, updated);
  },
}));

import { TemperatureUnit } from '#/api/types';
import { getItem, setItem } from '#/utils/storage';
import { create } from 'zustand';

const TEMP_UNIT_KEY = 'temperature_unit';

interface UnitsStore {
  unit: TemperatureUnit;
  load: () => Promise<void>;
  toggleUnit: () => void;
}

export const useUnitsStore = create<UnitsStore>((set, get) => ({
  unit: 'C',

  load: async () => {
    const stored = await getItem<TemperatureUnit>(TEMP_UNIT_KEY);
    if (stored) set({ unit: stored });
  },

  toggleUnit: () => {
    const next = get().unit === 'C' ? 'F' : 'C';
    set({ unit: next });
    setItem(TEMP_UNIT_KEY, next);
  },
}));

import { create } from 'zustand';

interface PagerStore {
  /**
   * The page index the pager should jump to.
   * null means 'no pending jump' - pager ignores it.
   */
  requestedPage: number | null;

  /**
   * Called by the locations list when a saved location is tapped.
   */
  requestPage: (index: number) => void;

  /**
   * Called by the pager after it has consumed the requests,
   * so it doesn't re-trigger on every render.
   */
  clearRequestedPage: () => void;
}

export const usePagerStore = create<PagerStore>((set) => ({
  requestedPage: null,
  requestPage: (index) => set({ requestedPage: index }),
  clearRequestedPage: () => set({ requestedPage: null }),
}));

import { create } from 'zustand';

interface SearchStore {
  query: string;
  isFocused: boolean;
  setQuery: (query: string) => void;
  setFocused: (focused: boolean) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  isFocused: false,
  setQuery: (query) => set({ query }),
  setFocused: (isFocused) => set({ isFocused }),
  clear: () => set({ query: '', isFocused: false }),
}));

import type { SearchBarCommands } from 'react-native-screens';
import { create } from 'zustand';

interface SearchStore {
  query: string;
  isFocused: boolean;
  searchBarRef: React.RefObject<SearchBarCommands | null> | null;
  setQuery: (query: string) => void;
  setFocused: (focused: boolean) => void;
  setSearchBarRef: (ref: React.RefObject<SearchBarCommands | null>) => void;
  clear: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  isFocused: false,
  searchBarRef: null,

  setQuery: (query) => set({ query }),
  setFocused: (isFocused) => set({ isFocused }),
  setSearchBarRef: (ref) => set({ searchBarRef: ref }),

  clear: () => {
    set({ query: '', isFocused: false });
    // Clear native search bar
    useSearchStore.getState().searchBarRef?.current?.blur();
    useSearchStore.getState().searchBarRef?.current?.clearText();
    useSearchStore.getState().searchBarRef?.current?.cancelSearch();
  },
}));

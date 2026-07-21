import i18n from '#/i18n';
import { useToastStore } from '#/store/toastStore';
import { QueryCache, QueryClient } from '@tanstack/react-query';

/**
 * Single QueryClient instance for the whole app.
 * Per-query overrides (staleTime, gcTime, retry) live in the hooks
 * themselves — see src/hooks/useWeather.ts. These are just sane app-wide
 * fallbacks for any query that doesn't set its own.
 *
 * queryCache.onError surfaces a toast for any failed query app-wide
 * (weather fetch, location search, etc.) since no query in the app
 * currently reads its own isError/error state.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: () => {
      useToastStore.getState().show(i18n.t('errors.dataFailed'));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 15 * 60 * 1000, // 15 min
      retry: 2,
      refetchOnReconnect: true,
      // Mobile apps don't have a browser "window focus" concept the same
      // way web does — this avoids unnecessary refetches when switching
      // between app screens.
      refetchOnWindowFocus: false,
    },
  },
});

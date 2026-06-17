import { QueryClient } from '@tanstack/react-query';

/**
 * Single QueryClient instance for the whole app.
 * Per-query overrides (staleTime, gcTime, retry) live in the hooks
 * themselves — see src/hooks/useWeather.ts. These are just sane app-wide
 * fallbacks for any query that doesn't set its own.
 */
export const queryClient = new QueryClient({
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

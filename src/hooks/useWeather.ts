import { Coordinates, Location } from '#/api/types';
import { getCurrentWeather } from '#/api/weather';
import { useQuery } from '@tanstack/react-query';

export const weatherKeys = {
  current: (lat: number, lon: number) => ['weather', 'current', lat, lon] as const,
};

/**
 * Fetches current weather condition.
 * Data is considered fresh for 10 minutes then re-fetched in the background.
 */
export function useCurrentWeather(coords: Coordinates | null, location: Location | null) {
  return useQuery({
    queryKey: coords ? weatherKeys.current(coords.lat, coords.lon) : ['weather', 'current', null],
    queryFn: () => getCurrentWeather(coords!, location!),
    enabled: coords !== null && location !== null,
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000, // keep in cache 30 min
    retry: 2,
  });
}

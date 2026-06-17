import { Location } from '#/api/types';
import * as ExpoLocation from 'expo-location';
import { useEffect, useState } from 'react';

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error' | 'unavailable';

interface UseLocationResult {
  location: Location | null;
  status: LocationStatus;
  error: string | null;
  // Call to re-request permission after a denial.
  retry: () => void;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      setStatus('requesting');

      // 1. Ask for permission
      const { status: permissionStatus } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (permissionStatus !== 'granted') {
        setStatus('denied');
        setError('Location permission denied. Enable it in Settings to use your current location.');
        return;
      }

      // 2. Get coordinates
      let coords: ExpoLocation.LocationObjectCoords;
      try {
        const position = await ExpoLocation.getCurrentPositionAsync();
        coords = position.coords;
      } catch {
        if (!cancelled) {
          setStatus('unavailable');
          setError('Could not get your location. Check that GPS is enabled.');
        }
        return;
      }

      // 3. Reverse geocod to a human name.
      const results = await ExpoLocation.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const place = results[0];

      if (!cancelled) {
        setLocation({
          name: place.city ?? place.subregion ?? place.region ?? 'Current Location',
          country: place.country ?? '',
          countryCode: place.isoCountryCode ?? '',
          state: place.region ?? undefined,
          lat: coords.latitude,
          lon: coords.longitude,
        });
        setStatus('granted');
      }
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return {
    location,
    status,
    error,
    retry: () => {
      setAttempt((n) => n + 1);
    },
  };
}

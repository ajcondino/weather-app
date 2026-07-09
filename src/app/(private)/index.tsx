import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { CurrentWeather, DailyForecast, Location } from '#/api/types';
import { LocationFooter } from '#/components/LocationFooter';
import { SkyBackground } from '#/components/SkyBackground';
import { WeatherCard } from '#/components/WeatherCard';
import { weatherKeys } from '#/hooks/useWeather';
import { useNotificationsStore } from '#/store/notificationsStore';
import { usePagerStore } from '#/store/pagerStore';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { scheduleAllWeatherAlerts } from '#/utils/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const requestedPage = usePagerStore((s) => s.requestedPage);
  const clearRequestedPage = usePagerStore((s) => s.clearRequestedPage);

  const savedLocations = useSavedLocationsStore((s) => s.locations);
  const isLoaded = useSavedLocationsStore((s) => s.isLoaded);

  const subscribedKeys = useNotificationsStore((s) => s.subscribedKeys);
  const notificationsEnabled = useNotificationsStore((s) => s.enabled);

  const subscribedLocations = savedLocations.filter((loc) =>
    subscribedKeys.includes(`${loc.lat},${loc.lon}`),
  );

  useEffect(() => {
    if (requestedPage === null) return;
    pagerRef.current?.setPage(requestedPage);
    clearRequestedPage();
  }, [requestedPage, clearRequestedPage]);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <SkyBackground />
      </View>
    );
  }

  if (savedLocations.length === 0) {
    router.replace('/location');
    return null;
  }

  return (
    <View style={styles.container}>
      <NotificationScheduler
        notificationsEnabled={notificationsEnabled}
        subscribedLocations={subscribedLocations}
        subscribedKeys={subscribedKeys}
      />
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        {savedLocations.map((location) => (
          <WeatherCard key={`${location.lat}-${location.lon}`} location={location} />
        ))}
      </PagerView>
      <LocationFooter count={savedLocations.length} activeIndex={activeIndex} />
    </View>
  );
}

function NotificationScheduler({
  notificationsEnabled,
  subscribedLocations,
  subscribedKeys,
}: {
  notificationsEnabled: boolean;
  subscribedLocations: Location[];
  subscribedKeys: string[];
}) {
  const queryClient = useQueryClient();
  const hasScheduled = useRef(false);

  // reset when subscriptions change so new subs get scheduled
  useEffect(() => {
    hasScheduled.current = false;
  }, [subscribedKeys]);

  useEffect(() => {
    if (!notificationsEnabled || subscribedLocations.length === 0) return;
    if (hasScheduled.current) return;

    const subscriptions = subscribedLocations
      .map((location) => {
        const cached = queryClient.getQueryData<CurrentWeather>(
          weatherKeys.current(location.lat, location.lon),
        );
        return cached ? { location, daily: cached.daily } : null;
      })
      .filter((s): s is { location: Location; daily: DailyForecast[] } => s !== null);

    if (subscriptions.length === 0) return;

    scheduleAllWeatherAlerts(subscriptions);
    hasScheduled.current = true;
  }, [notificationsEnabled, subscribedKeys, subscribedLocations, queryClient]);

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
});

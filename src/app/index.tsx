import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { LocationFooter } from '#/components/LocationFooter';
import { SkyBackground } from '#/components/SkyBackground';
import { WeatherCard } from '#/components/WeatherCard';
import { usePagerStore } from '#/store/pagerStore';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
});

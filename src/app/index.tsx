import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { LocationFooter } from '#/components/LocationFooter';
import { SkyBackground } from '#/components/SkyBackground';
import { WeatherCard } from '#/components/WeatherCard';
import { useLocation } from '#/hooks/useLocation';
import { usePagerStore } from '#/store/pagerStore';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { useEffect, useRef, useState } from 'react';

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const { location } = useLocation();

  const requestedPage = usePagerStore((s) => s.requestedPage);
  const clearRequestedPage = usePagerStore((s) => s.clearRequestedPage);

  const savedLocations = useSavedLocationsStore((s) => s.locations);
  const isLoaded = useSavedLocationsStore((s) => s.isLoaded);

  useEffect(() => {
    if (requestedPage === null) return;
    pagerRef.current?.setPage(requestedPage);
    clearRequestedPage();
  }, [requestedPage]);

  if (!isLoaded) {
    return (
      // TODO: Add a loading card
      <View style={styles.container}>
        <SkyBackground />
      </View>
    );
  }

  const totalCount = 1 + savedLocations.length;

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <WeatherCard key="gps" location={location} />
        {savedLocations.map((location) => (
          <WeatherCard key={`${location.lat}-${location.lon}`} location={location} />
        ))}
      </PagerView>
      <LocationFooter count={totalCount} activeIndex={activeIndex} />
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

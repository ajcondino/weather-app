import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { Location } from '#/api/types';
import { LocationFooter } from '#/components/LocationFooter';
import { WeatherCard } from '#/components/WeatherCard';
import { useLocation } from '#/hooks/useLocation';
import { useState } from 'react';

const MOCK_SAVED: Location[] = [
  { lat: 10.7202, lon: 122.5621, name: 'Iloilo City', country: 'Philippines', countryCode: 'PH' },
  { lat: 35.6762, lon: 139.6503, name: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  { lat: 51.5074, lon: -0.1278, name: 'London', country: 'United Kingdom', countryCode: 'GB' },
];

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  const { location } = useLocation();

  const totalCount = 1 + MOCK_SAVED.length;

  return (
    <View style={styles.container}>
      <PagerView
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <WeatherCard key="gps" location={location} />
        {MOCK_SAVED.map((location) => (
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

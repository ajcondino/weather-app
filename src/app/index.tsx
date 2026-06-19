import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { LocationFooter } from '#/components/LocationFooter';
import { SkyBackground } from '#/components/SkyBackground';
import WeatherHeader from '#/components/WeatherHeader';
import { useLocation } from '#/hooks/useLocation';
import { useCurrentWeather } from '#/hooks/useWeather';

export default function HomeScreen() {
  const { location } = useLocation();
  const {
    data: weather,
    refetch,
    isRefetching,
  } = useCurrentWeather(location ? { lat: location.lat, lon: location.lon } : null, location);

  return (
    <>
      <SkyBackground condition={weather?.condition} isDay={weather?.isDay} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      >
        <WeatherHeader weather={weather} />
      </ScrollView>
      <LocationFooter />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

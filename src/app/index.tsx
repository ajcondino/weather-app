import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { HourlyForecastCard } from '#/components/HourlyForecastCard';
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
    <View style={styles.root}>
      <SkyBackground condition={weather?.condition} isDay={weather?.isDay} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      >
        <WeatherHeader weather={weather} />

        {weather && (
          <>
            {weather.hourly.length > 0 && (
              <View style={styles.hourlyWrapper}>
                <HourlyForecastCard hours={weather?.hourly} />
              </View>
            )}
          </>
        )}
      </ScrollView>
      <LocationFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  hourlyWrapper: {
    marginTop: 10,
  },
});

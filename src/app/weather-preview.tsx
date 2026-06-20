import { Coordinates, Location } from '#/api/types';
import { DailyForecastCard } from '#/components/DailyForecastCard';
import { HourlyForecastCard } from '#/components/HourlyForecastCard';
import { SkyBackground } from '#/components/SkyBackground';
import WeatherHeader from '#/components/WeatherHeader';
import { useCurrentWeather } from '#/hooks/useWeather';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function WeatherPreviewModal() {
  const { lat, lon, name, country, countryCode } = useLocalSearchParams<{
    lat: string;
    lon: string;
    name: string;
    country?: string;
    countryCode?: string;
  }>();

  const coords: Coordinates = { lat: Number(lat), lon: Number(lon) };
  const location: Location = {
    lat: coords.lat,
    lon: coords.lon,
    name,
    country: country ?? '',
    countryCode: countryCode ?? '',
  };

  const { data: weather } = useCurrentWeather(coords, location);

  return (
    <View style={styles.root}>
      <SkyBackground condition={weather?.condition} isDay={weather?.isDay} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <WeatherHeader weather={weather} />
        {weather && (
          <>
            {weather.hourly.length > 0 && (
              <View style={styles.hourlyWrapper}>
                <HourlyForecastCard hours={weather?.hourly} />
              </View>
            )}

            {weather.daily.length > 0 && (
              <View style={styles.dailyWrapper}>
                <DailyForecastCard days={weather?.daily} />
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  dailyWrapper: {
    marginTop: 10,
  },
});

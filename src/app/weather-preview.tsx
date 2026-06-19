import { Coordinates, Location } from '#/api/types';
import { SkyBackground } from '#/components/SkyBackground';
import WeatherHeader from '#/components/WeatherHeader';
import { useCurrentWeather } from '#/hooks/useWeather';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

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
    <ScrollView contentContainerStyle={styles.container}>
      <SkyBackground condition={weather?.condition} isDay={weather?.isDay} />
      <WeatherHeader weather={weather} />
    </ScrollView>
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

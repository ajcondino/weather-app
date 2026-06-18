import { Coordinates, Location } from '#/api/types';
import { useCurrentWeather } from '#/hooks/useWeather';
import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

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
    <View style={styles.container}>
      <Text>{weather?.location.name}</Text>
      <Text>{weather?.temperatureC}°</Text>
      <Text>
        <Link href="/location">Settings</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});

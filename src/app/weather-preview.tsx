import { Coordinates, Location } from '#/api/types';
import { WeatherCard } from '#/components/WeatherCard';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

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

  return (
    <View style={styles.root}>
      <WeatherCard location={location} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

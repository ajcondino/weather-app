import { CurrentWeather } from '#/api/types';
import { WEATHER_DESCRIPTIONS } from '#/themes/weatherDescriptions';
import { StyleSheet, Text, View } from 'react-native';

interface WeatherHeaderProps {
  weather?: CurrentWeather;
}

export default function WeatherHeader({ weather }: WeatherHeaderProps) {
  if (!weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.location}>--</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.location}>{weather.location.name}</Text>
      <Text style={styles.temperature}>{Math.ceil(weather.temperatureC)}°</Text>
      <Text style={styles.condition}>{WEATHER_DESCRIPTIONS[weather.condition]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 28,
  },
  location: {
    fontSize: 34,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  temperature: {
    fontSize: 96,
    fontWeight: '100',
    color: '#fff',
    letterSpacing: -4,
    lineHeight: 108,
  },
  condition: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
});

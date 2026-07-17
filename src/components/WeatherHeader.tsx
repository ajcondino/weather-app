import { CurrentWeather } from '#/api/types';
import { useUnitsStore } from '#/store/unitsStore';
import { formatTemp } from '#/utils/temperature';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface WeatherHeaderProps {
  weather?: CurrentWeather;
}

export default function WeatherHeader({ weather }: WeatherHeaderProps) {
  const unit = useUnitsStore((s) => s.unit);
  const { t } = useTranslation();

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
      <Text style={styles.temperature}>{formatTemp(weather.temperatureC, unit)}</Text>
      <Text style={styles.condition}>{t(`weather.conditions.${weather.condition}`)}</Text>
      <Text style={styles.highLow}>
        H: {weather.daily[0]?.maxTempC}° L: {weather.daily[0]?.minTempC}°
      </Text>
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
    fontWeight: '400',
    letterSpacing: 0.4,
    marginBottom: 2,
    color: 'rgba(255,255,255,0.75)',
  },
  temperature: {
    fontSize: 96,
    fontWeight: '200',
    letterSpacing: -4,
    lineHeight: 108,
    color: 'rgba(255,255,255,0.75)',
  },
  condition: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  highLow: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
});

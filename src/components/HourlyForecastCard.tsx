import { HourlyForecast } from '#/api/types';
import { useUnitsStore } from '#/store/unitsStore';
import { getWeatherIcon } from '#/themes/weatherIcons';
import { formatTemp } from '#/utils/temperature';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CardHeader } from './CardHeader';

interface HourlyForecastCardProps {
  hours: HourlyForecast[];
}

export function HourlyForecastCard({ hours }: HourlyForecastCardProps) {
  const { t } = useTranslation();

  if (hours.length === 0) return null;

  return (
    <BlurView intensity={30} tint="dark" style={styles.card}>
      <CardHeader title={t('weather.hourlyForecastTitle')} style={styles.header} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hours.map((hour, i) => (
          <HourCell key={hour.time} hour={hour} isNow={i === 0} />
        ))}
      </ScrollView>
    </BlurView>
  );
}

function HourCell({ hour, isNow }: { hour: HourlyForecast; isNow: boolean }) {
  const unit = useUnitsStore((s) => s.unit);

  const Icon = getWeatherIcon(hour.condition, hour.isDay);
  const label = isNow ? 'Now' : formatHour(hour.time);

  return (
    <View style={styles.cell}>
      <Text style={styles.hourLabel}>{label}</Text>
      <Icon color="#fff" size={28} />
      <Text style={styles.temp}>{formatTemp(hour.temperatureC, unit)}</Text>
    </View>
  );
}

function formatHour(isoTime: string): string {
  const date = new Date(isoTime);
  return date.toLocaleTimeString(undefined, { hour: 'numeric' });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 14,
  },
  header: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 25,
  },
  cell: {
    alignItems: 'center',
    minWidth: 36,
    gap: 12,
  },
  hourLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  icon: {
    marginVertical: 8,
  },
  temp: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
});

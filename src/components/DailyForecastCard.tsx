import { DailyForecast } from '#/api/types';
import { getWeatherIcon } from '#/themes/weatherIcons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import { CardHeader } from './CardHeader';

interface DailyForecastCardProps {
  days: DailyForecast[];
}

export function DailyForecastCard({ days }: DailyForecastCardProps) {
  if (days.length === 0) return null;

  return (
    <BlurView intensity={30} tint="dark" style={styles.card}>
      <CardHeader title={`${days.length}-Day Forecast`} style={styles.header} />

      {days.map((day, i) => (
        <DayRow key={day.date} day={day} isToday={i === 0} isLast={i === days.length - 1} />
      ))}
    </BlurView>
  );
}

function DayRow({
  day,
  isToday,
  isLast,
}: {
  day: DailyForecast;
  isToday: boolean;
  isLast: boolean;
}) {
  // Open-Meteo's daily data is per-day aggregrate, not split by time of day
  // so we'll always be using the day variant for icons to match conventions on most weather apps.
  const Icon = getWeatherIcon(day.condition, true);
  const date = new Date(day.date);
  const label = isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' });

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <Text style={styles.dayLabel}>{label}</Text>
      <View style={styles.precipRow}>
        <Icon color="#fff" size={28} style={styles.icon} />
        <Text style={styles.precipText}>{day.precipitationProbabilityMax}%</Text>
      </View>
      <View style={styles.temps}>
        <Text style={styles.minTemp}>{Math.round(day.minTempC)}°</Text>
        <Text style={styles.maxTemp}>{Math.round(day.maxTempC)}°</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  header: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  dayLabel: {
    width: 70,
    fontSize: 20,
    color: '#fff',
  },
  icon: {
    width: 28,
  },
  precipRow: {
    flex: 1,
    marginRight: 20,
    gap: 2,
    alignItems: 'center',
  },
  precipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5AC8FA',
  },
  temps: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minWidth: 60,
    justifyContent: 'space-between',
  },
  minTemp: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
  },
  maxTemp: {
    fontSize: 20,
    color: '#fff',
  },
});

import { DailyForecast } from '#/api/types';
import { useUnitsStore } from '#/store/unitsStore';
import { getWeatherIcon } from '#/themes/weatherIcons';
import { formatTemp } from '#/utils/temperature';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import { CardHeader } from './CardHeader';
import { TemperatureRangeBar } from './TemperatureRangeBar';

interface DailyForecastCardProps {
  days: DailyForecast[];
  /** Today's current temperature */
  currentTempC?: number;
}

export function DailyForecastCard({ days, currentTempC }: DailyForecastCardProps) {
  if (days.length === 0) return null;

  // Computed once across the whole week
  const weekMinC = Math.min(...days.map((d) => d.minTempC));
  const weekMaxC = Math.max(...days.map((d) => d.maxTempC));

  return (
    <BlurView intensity={30} tint="dark" style={styles.card}>
      <CardHeader title={`${days.length}-Day Forecast`} style={styles.header} />

      {days.map((day, i) => (
        <DayRow
          key={day.date}
          day={day}
          isToday={i === 0}
          isLast={i === days.length - 1}
          weekMinC={weekMinC}
          weekMaxC={weekMaxC}
          currentTempC={i === 0 ? currentTempC : undefined}
        />
      ))}
    </BlurView>
  );
}

function DayRow({
  day,
  isToday,
  isLast,
  weekMinC,
  weekMaxC,
  currentTempC,
}: {
  day: DailyForecast;
  isToday: boolean;
  isLast: boolean;
  weekMinC: number;
  weekMaxC: number;
  currentTempC?: number;
}) {
  const unit = useUnitsStore((s) => s.unit);
  // Open-Meteo's daily data is per-day aggregrate, not split by time of day
  // so we'll always be using the day variant for icons to match conventions on most weather apps.
  const Icon = getWeatherIcon(day.condition, true);
  const date = new Date(day.date);
  const label = isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' });

  // Only show probability when there's a meaningful chance of rain
  const showPrecip = day.precipitationProbabilityMax >= 10;

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <Text style={styles.dayLabel}>{label}</Text>

      <View style={styles.iconColumn}>
        <Icon color="#fff" size={26} />
        <Text style={[styles.precipText, !showPrecip && styles.precipTextHidden]}>
          {showPrecip ? `${Math.round(day.precipitationProbabilityMax)}%` : '—'}
        </Text>
      </View>

      <Text style={styles.minTemp}>{formatTemp(day.minTempC, unit)}</Text>

      <TemperatureRangeBar
        minTempC={day.minTempC}
        maxTempC={day.maxTempC}
        weekMinC={weekMinC}
        weekMaxC={weekMaxC}
        currentTempC={currentTempC}
        width={90}
      />

      <Text style={styles.maxTemp}>{formatTemp(day.maxTempC, unit)}</Text>
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
    fontSize: 15,
    color: '#fff',
  },
  iconColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  precipText: {
    fontSize: 12,
    color: '#5AC8FA',
  },
  precipTextHidden: {
    opacity: 0,
  },
  minTemp: {
    width: 26,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    marginRight: 10,
  },
  maxTemp: {
    width: 30,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
    marginLeft: 10,
  },
});

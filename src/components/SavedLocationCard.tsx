import { Location } from '#/api/types';
import { useCurrentWeather } from '#/hooks/useWeather';
import { useUnitsStore } from '#/store/unitsStore';
import { WEATHER_DESCRIPTIONS } from '#/themes/weatherDescriptions';
import { formatTemp } from '#/utils/temperature';
import { StyleSheet, Text, View } from 'react-native';
import { SkyBackground } from './SkyBackground';

interface SavedLocationCardProps {
  location: Location;
}

export function SavedLocationCard({ location }: SavedLocationCardProps) {
  const unit = useUnitsStore((s) => s.unit);

  const { data: weather } = useCurrentWeather({ lat: location.lat, lon: location.lon }, location);

  const localTime = getLocalTime(location.lon);

  return (
    <View style={styles.card}>
      <SkyBackground condition={weather?.condition ?? 'clear'} isDay={weather?.isDay ?? true} />

      <View style={styles.content}>
        {/* Left: name + local time */}
        <View style={styles.left}>
          <View>
            <Text style={styles.name} numberOfLines={1}>
              {location.name}
            </Text>
            <Text style={styles.time}>{localTime}</Text>
          </View>
          <Text style={styles.condition} numberOfLines={1}>
            {weather ? WEATHER_DESCRIPTIONS[weather.condition] : ''}
          </Text>
        </View>

        {/* Right: temperature + condition */}
        <View style={styles.right}>
          <Text style={styles.temperature}>
            {weather ? formatTemp(weather.temperatureC, unit) : '—'}
          </Text>
          {weather && (
            <Text style={styles.highLow} numberOfLines={1}>
              H: {weather.daily[0].maxTempC}° L: {weather.daily[0].minTempC}°
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * Derives a rough local time from longitude.
 * This is a fast approximation — accurate to within ~30 min for most cities.
 * The proper solution is IANA timezone data (e.g. a separate API call or a
 * bundled tz database), but that's a later refinement. For now this gives
 * a plausible local time without any extra dependency or network call.
 *
 * 15° of longitude ≈ 1 hour offset from UTC.
 */
function getLocalTime(lon: number): string {
  const offsetHours = lon / 15;
  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60 * 1000;
  const localMs = utcMs + offsetHours * 60 * 60 * 1000;
  const local = new Date(localMs);

  return local.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  card: {
    height: 115,
    borderRadius: 18,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  left: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  time: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  temperature: {
    fontSize: 44,
    fontWeight: '300',
    color: '#fff',
    lineHeight: 48,
  },
  condition: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  highLow: {
    fontSize: 13,
    color: '#fff',
    marginTop: 2,
  },
});

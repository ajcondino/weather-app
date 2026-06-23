import { Location } from '#/api/types';
import { useCurrentWeather } from '#/hooks/useWeather';
import { ScrollView, StyleSheet, View } from 'react-native';
import { DailyForecastCard } from './DailyForecastCard';
import { HourlyForecastCard } from './HourlyForecastCard';
import { SkyBackground } from './SkyBackground';
import WeatherHeader from './WeatherHeader';

interface WeatherCardProps {
  location: Location | null;
}

export function WeatherCard({ location }: WeatherCardProps) {
  const { data: weather } = useCurrentWeather(
    location ? { lat: location.lat, lon: location.lon } : null,
    location,
  );

  return (
    <>
      <SkyBackground condition={weather?.condition} isDay={weather?.isDay} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  hourlyWrapper: {
    marginTop: 10,
  },
  dailyWrapper: {
    marginTop: 10,
  },
});

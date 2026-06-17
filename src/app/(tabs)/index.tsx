import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLocation } from '#/hooks/useLocation';
import { useCurrentWeather } from '#/hooks/useWeather';

export default function Index() {
  const { location, status } = useLocation();
  const {
    data: weather,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useCurrentWeather(location ? { lat: location.lat, lon: location.lon } : null, location);

  if (status === 'requesting' || isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Loading...</Text>
      </View>
    );
  }

  if (status === 'denied' || isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Location access denied or failed to fetch weather.</Text>
        <Text style={styles.paragraph} onPress={() => refetch()} disabled={isRefetching}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
    >
      <Text>{weather?.location.name}</Text>
      <Text>{weather?.temperatureC}°</Text>
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
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});

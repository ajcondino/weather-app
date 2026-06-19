import { searchLocations } from '#/api/geocoding';
import { Location } from '#/api/types';
import { LocationFooter } from '#/components/LocationFooter';
import { useHeaderHeight } from '@react-navigation/elements';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LocationScreen() {
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query?: string }>();
  const [debouncedQuery, setDebouncedQuery] = useState(query ?? '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query ?? '');
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const isSearching = debouncedQuery.length > 0;

  const { data: searchResults = [] } = useQuery({
    queryKey: ['locationsSearch', debouncedQuery],
    queryFn: () => searchLocations(debouncedQuery),
    enabled: isSearching,
  });

  function onSelectSearchResult(result: Location) {
    router.push({
      pathname: '/weather-preview',
      params: { lat: String(result.lat), lon: String(result.lon), name: result.name },
    });
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight }]}
      >
        <Text style={styles.paragraph}>Learn more about weather data and map data</Text>
      </ScrollView>

      <LocationFooter />

      {isSearching && (
        <BlurView style={[StyleSheet.absoluteFill, { top: headerHeight + 12 }]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.name + item.lat + item.lon}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.6}
                onPress={() => onSelectSearchResult(item)}
              >
                <Text style={styles.resultText}>
                  {item.name}, {item.state ? item.state + ', ' : ''}
                  {item.country}
                </Text>
              </TouchableOpacity>
            )}
          />
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  fill: {
    flex: 1,
  },
  paragraph: {
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 11,
  },
  scrollContent: {
    padding: 20,
  },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
  },
  resultSecondary: {
    color: 'rgba(255,255,255,0.60)',
  },
});

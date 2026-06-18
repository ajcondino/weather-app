import { searchLocations } from '#/api/geocoding';
import { Location } from '#/api/types';
import { useHeaderHeight } from '@react-navigation/elements';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

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
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text>
          Viewing details for location: {query}
          <Link href="/weather/1">View Location Details</Link>
        </Text>
      </ScrollView>

      {isSearching && (
        <BlurView
          tint="systemMaterial"
          intensity={10}
          style={[StyleSheet.absoluteFill, { top: headerHeight }]}
        >
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.name + item.lat + item.lon}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.6}
                onPress={() => onSelectSearchResult(item)}
              >
                <Text>
                  {item.name}, {item.state ? item.state + ', ' : ''}
                  {item.country}
                </Text>
              </TouchableOpacity>
            )}
          />
        </BlurView>
      )}
    </>
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
  row: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 17,
  },
});

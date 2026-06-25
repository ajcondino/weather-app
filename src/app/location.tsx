import { searchLocations } from '#/api/geocoding';
import { Location } from '#/api/types';
import { SavedLocationCard } from '#/components/SavedLocationCard';
import { usePagerStore } from '#/store/pagerStore';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { useHeaderHeight } from '@react-navigation/elements';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LocationScreen() {
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const { query, isFocused } = useLocalSearchParams<{ query?: string; isFocused?: string }>();
  const [debouncedQuery, setDebouncedQuery] = useState(query ?? '');

  const requestPage = usePagerStore((s) => s.requestPage);

  const savedLocations = useSavedLocationsStore((s) => s.locations);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query ?? '');
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const isSearching = debouncedQuery.length > 0 || isFocused === 'true';

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

  function onSelectSavedLocation(index: number) {
    // Page 0 is the current location from GPS, saved locations start at page 1, so offset by 1
    requestPage(1 + index);
    router.back();
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}
      >
        {savedLocations.map((location, i) => (
          <TouchableOpacity
            key={`${location.lat}-${location.lon}`}
            activeOpacity={0.8}
            onPress={() => onSelectSavedLocation(i)}
          >
            <SavedLocationCard location={location} />
          </TouchableOpacity>
        ))}
        <Text style={styles.paragraph}>Learn more about weather data and map data</Text>
      </ScrollView>

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
  scroll: {
    flex: 1,
  },
  content: {
    marginTop: 12,
    padding: 20,
    gap: 12,
  },
  paragraph: {
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 11,
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

import { searchLocations } from '#/api/geocoding';
import { Location } from '#/api/types';
import { SavedLocationCard } from '#/components/SavedLocationCard';
import { usePagerStore } from '#/store/pagerStore';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trash2Icon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

export default function LocationScreen() {
  const router = useRouter();
  const { query, isFocused } = useLocalSearchParams<{ query?: string; isFocused?: string }>();
  const [debouncedQuery, setDebouncedQuery] = useState(query ?? '');
  const openSwipeableRef = useRef<SwipeableMethods>(null);

  const requestPage = usePagerStore((s) => s.requestPage);

  const savedLocations = useSavedLocationsStore((s) => s.locations);
  const removeLocation = useSavedLocationsStore((s) => s.removeLocation);

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
    requestPage(index);
    router.back();
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {savedLocations.map((location, i) => (
          <SwipeableLocationRow
            key={`${location.lat}-${location.lon}`}
            location={location}
            onPress={() => onSelectSavedLocation(i)}
            onDelete={() => removeLocation(location.lat, location.lon)}
            openSwipeableRef={openSwipeableRef}
          />
        ))}
        <Text style={styles.paragraph}>Learn more about weather data and map data</Text>
      </ScrollView>

      {isSearching && (
        <View style={StyleSheet.absoluteFill}>
          <FlatList
            style={[{ backgroundColor: '#000' }, debouncedQuery.length > 0 && { opacity: 80 }]}
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
        </View>
      )}
    </View>
  );
}

function SwipeableLocationRow({
  location,
  onPress,
  onDelete,
  openSwipeableRef,
}: {
  location: Location;
  onPress: () => void;
  onDelete: () => void;
  openSwipeableRef: React.RefObject<SwipeableMethods | null>;
}) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      rightThreshold={40}
      renderRightActions={() => (
        <Pressable style={styles.deleteAction} onPress={onDelete}>
          <Trash2Icon color="#fff" />
        </Pressable>
      )}
      onSwipeableWillOpen={() => {
        if (openSwipeableRef.current && openSwipeableRef.current !== swipeableRef.current) {
          openSwipeableRef.current.close();
        }
        openSwipeableRef.current = swipeableRef.current;
      }}
      onSwipeableClose={() => {
        if (openSwipeableRef.current === swipeableRef.current) {
          openSwipeableRef.current = null;
        }
      }}
    >
      <Pressable onPress={onPress}>
        <SavedLocationCard location={location} />
      </Pressable>
    </ReanimatedSwipeable>
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
    paddingHorizontal: 20,
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
  deleteAction: {
    borderRadius: 18,
    backgroundColor: 'red',
    justifyContent: 'center',
    marginLeft: 12,
    alignItems: 'center',
    width: 80,
  },
});

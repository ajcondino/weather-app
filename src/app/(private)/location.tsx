import { searchLocations } from '#/api/geocoding';
import { Location } from '#/api/types';
import { NetworkOfflineLabel } from '#/components/NetworkIndicator';
import { SavedLocationCard } from '#/components/SavedLocationCard';
import { locationKey, useNotificationsStore } from '#/store/notificationsStore';
import { usePagerStore } from '#/store/pagerStore';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { useSearchStore } from '#/store/searchStore';
import { useUnitsStore } from '#/store/unitsStore';
import { useHeaderHeight } from '@react-navigation/elements';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRouter } from 'expo-router';
import { BellIcon, BellOffIcon, SettingsIcon, Trash2Icon } from 'lucide-react-native';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInputFocusEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SearchBarCommands } from 'react-native-screens';

export default function LocationScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();

  const query = useSearchStore((s) => s.query);
  const isFocused = useSearchStore((s) => s.isFocused);

  const [debouncedQuery, setDebouncedQuery] = useState(query ?? '');

  const searchBarRef = useRef<SearchBarCommands>(null);
  const setSearchBarRef = useSearchStore((s) => s.setSearchBarRef);

  const openSwipeableRef = useRef<SwipeableMethods>(null);

  const requestPage = usePagerStore((s) => s.requestPage);

  const savedLocations = useSavedLocationsStore((s) => s.locations);
  const removeLocation = useSavedLocationsStore((s) => s.removeLocation);

  const unsubscribeLocation = useNotificationsStore((s) => s.unsubscribeLocation);

  const unit = useUnitsStore((s) => s.unit);

  useLayoutEffect(() => {
    setSearchBarRef(searchBarRef);

    navigation.setOptions({
      headerSearchBarOptions: {
        ref: searchBarRef,
        placeholder: t('location.searchPlaceholder'),
        hideWhenScrolling: false,
        onChangeText: (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
          useSearchStore.getState().setQuery(event.nativeEvent.text);
        },
        onFocus: () => {
          useSearchStore.getState().setFocused(true);
        },
        onBlur: () => {
          useSearchStore.getState().setFocused(false);
        },
      },
      headerRight: () => (
        <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
          <SettingsIcon color="#fff" size={24} />
        </Pressable>
      ),
    });
  }, [navigation, unit]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query ?? '');
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const isSearching = debouncedQuery.length > 0 || isFocused;

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
    if (router.canGoBack()) return router.back();
    router.replace('/');
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <NetworkOfflineLabel />
        {savedLocations.map((location, i) => (
          <SwipeableLocationRow
            key={`${location.lat}-${location.lon}`}
            location={location}
            onPress={() => onSelectSavedLocation(i)}
            onDelete={() => {
              removeLocation(location.lat, location.lon);
              unsubscribeLocation(location.lat, location.lon);
            }}
            openSwipeableRef={openSwipeableRef}
          />
        ))}
        <Text style={styles.paragraph}>{t('location.learnMoreParagraph')}</Text>
      </ScrollView>

      {isSearching && (
        <View style={[StyleSheet.absoluteFill, { top: headerHeight }]}>
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

  const subscribedKeys = useNotificationsStore((s) => s.subscribedKeys);
  const subscribeLocation = useNotificationsStore((s) => s.subscribeLocation);
  const unsubscribeLocation = useNotificationsStore((s) => s.unsubscribeLocation);
  const notificationsEnabled = useNotificationsStore((s) => s.enabled);

  const subscribed = subscribedKeys.includes(locationKey(location.lat, location.lon));

  function onBellPress() {
    if (subscribed) {
      unsubscribeLocation(location.lat, location.lon);
    } else {
      subscribeLocation(location);
    }
    swipeableRef.current?.close();
  }

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
      renderLeftActions={() =>
        notificationsEnabled ? (
          <Pressable
            style={[styles.bellAction, subscribed && styles.bellActionActive]}
            onPress={onBellPress}
          >
            {subscribed ? <BellOffIcon color="#fff" /> : <BellIcon color="#fff" />}
          </Pressable>
        ) : null
      }
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
  bellAction: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    marginRight: 12,
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  bellActionActive: {
    backgroundColor: '#4FA8E8',
  },
});

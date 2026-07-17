import { Location } from '#/api/types';
import { WeatherCard } from '#/components/WeatherCard';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { useSearchStore } from '#/store/searchStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function WeatherPreviewModal() {
  const router = useRouter();
  const saveLocation = useSavedLocationsStore((s) => s.saveLocation);
  const savedLocations = useSavedLocationsStore((s) => s.locations);
  const { t } = useTranslation();

  const { lat, lon, name, country, countryCode } = useLocalSearchParams<{
    lat: string;
    lon: string;
    name: string;
    country?: string;
    countryCode?: string;
  }>();

  const location: Location = {
    lat: Number(lat),
    lon: Number(lon),
    name,
    country: country ?? '',
    countryCode: countryCode ?? '',
  };

  const alreadySaved = savedLocations.some((l) => l.lat === location.lat && l.lon === location.lon);

  function onCancel() {
    router.back();
  }

  function onAdd() {
    if (alreadySaved) return;
    saveLocation(location);
    useSearchStore.getState().clear();
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerLeft: () => {
            return (
              <Pressable onPress={onCancel}>
                <Text style={styles.cancelButton}>{t('weatherPreview.cancel')}</Text>
              </Pressable>
            );
          },
          headerRight: () => {
            return alreadySaved ? undefined : (
              <Pressable onPress={onAdd}>
                <Text style={styles.addButton}>{t('weatherPreview.add')}</Text>
              </Pressable>
            );
          },
        }}
      />
      <View style={styles.root}>
        <WeatherCard location={location} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  cancelButton: {
    fontSize: 17,
    color: '#fff',
  },
  addButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});

import { queryClient } from '#/lib/queryClient';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const router = useRouter();
  const load = useSavedLocationsStore((s) => s.load);

  useEffect(() => {
    load();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerBackVisible: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="location"
          options={{
            headerShown: true,
            headerTitle: 'Weather',
            headerLargeTitle: true,
            headerSearchBarOptions: {
              placeholder: 'Search for a city or airport',
              hideWhenScrolling: false,
              onChangeText: (event) => {
                router.setParams({ query: event.nativeEvent.text });
              },
              onFocus: () => {
                router.setParams({ isFocused: 'true' });
              },
              onBlur: () => {
                router.setParams({ isFocused: 'false' });
              },
            },
          }}
        />
        <Stack.Screen
          name="weather-preview"
          options={{
            presentation: 'modal',
            gestureEnabled: true,
            headerShown: true,
            headerTransparent: true,
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}

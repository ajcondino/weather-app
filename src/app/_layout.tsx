import { queryClient } from '#/lib/queryClient';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const load = useSavedLocationsStore((s) => s.load);

  useEffect(() => {
    load();
  }, []);

  return (
    <GestureHandlerRootView>
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
              headerTransparent: true,
              headerBlurEffect: 'dark',
              headerLargeTitleShadowVisible: false,
              headerShadowVisible: false,
              headerStyle: {
                backgroundColor: '#000',
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
    </GestureHandlerRootView>
  );
}

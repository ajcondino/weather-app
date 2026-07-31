import { NetworkBanner } from '#/components/NetworkIndicator';
import { Toast } from '#/components/Toast';
import { asyncStoragePersister } from '#/lib/persister';
import { queryClient } from '#/lib/queryClient';
import { useNotificationsStore } from '#/store/notificationsStore';
import { useSavedLocationsStore } from '#/store/savedLocationsStore';
import { useUnitsStore } from '#/store/unitsStore';
import { useAuth } from '@clerk/expo';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function PrivateRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const loadLocations = useSavedLocationsStore((s) => s.load);
  const loadUnits = useUnitsStore((s) => s.load);
  const loadNotifications = useNotificationsStore((s) => s.load);

  useEffect(() => {
    loadLocations();
    loadUnits();
    loadNotifications();
  }, []);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: asyncStoragePersister, maxAge: 24 * 60 * 60 * 1000 }}
      >
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
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'modal',
              gestureEnabled: true,
              headerShown: true,
              headerTransparent: true,
            }}
          />
        </Stack>
        <NetworkBanner />
        <Toast />
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

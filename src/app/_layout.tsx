import { queryClient } from '#/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

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
            },
          }}
        />
        <Stack.Screen
          name="weather-preview"
          options={{ presentation: 'modal', gestureEnabled: true }}
        />
      </Stack>
    </QueryClientProvider>
  );
}

import { ErrorFallback } from '#/components/ErrorFallback';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { ErrorBoundaryProps, Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// TODO: validate env using zod or similar library
if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} onRetry={retry} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

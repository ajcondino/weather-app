import '#/i18n';

import { ErrorFallback } from '#/components/ErrorFallback';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import * as Sentry from '@sentry/react-native';
import { ErrorBoundaryProps, Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  enableLogs: false,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// TODO: validate env using zod or similar library
if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ErrorFallback error={error} onRetry={retry} />;
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

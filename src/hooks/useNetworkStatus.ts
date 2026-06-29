import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isUnknown: boolean;
  lastOnlineAt: Date | null;
}

export function useNetworkStatus(): NetworkStatus {
  const { isConnected, isInternetReachable } = useNetInfo();
  const isUnknown = isConnected === null || isInternetReachable === null;
  const isOnline = isConnected !== false && isInternetReachable !== false;

  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const wasOnline = useRef<boolean | null>(null);

  useEffect(() => {
    // Skip the initial null state
    if (isUnknown) return;

    if (wasOnline.current === true && !isOnline) {
      // Just went offline - record the timestamp
      setLastOnlineAt(new Date());
    }

    if (isOnline) {
      // Back online - clear the timestamp
      setLastOnlineAt(null);
    }

    wasOnline.current = isOnline;
  }, [isOnline, isUnknown]);

  return { isUnknown, isOnline, lastOnlineAt };
}

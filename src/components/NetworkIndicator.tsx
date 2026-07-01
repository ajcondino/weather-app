import { useNetworkStatus } from '#/hooks/useNetworkStatus';
import { BlurView } from 'expo-blur';
import { useSegments } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Segment = ReturnType<typeof useSegments>[number];

const BANNER_EXCLUDED_ROUTES: Segment[] = ['location'];

export function NetworkBanner() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const { isOnline, lastOnlineAt } = useNetworkStatus();

  const isExcluded = BANNER_EXCLUDED_ROUTES.some((route) => segments.includes(route as never));

  if (isOnline || isExcluded) return null;

  const formatted = lastOnlineAt?.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <BlurView
      intensity={80}
      tint="systemMaterialDark"
      style={[styles.banner, { paddingTop: insets.top }]}
    >
      <View style={styles.bannerRow}>
        <WifiOff color="#fff" size={16} />
        <Text style={styles.bannerText}>No Internet Connection</Text>
      </View>
      <Text style={styles.bannerTextSecondary}>Last online: {formatted}</Text>
    </BlurView>
  );
}

export function NetworkOfflineLabel() {
  const { isOnline, lastOnlineAt } = useNetworkStatus();

  if (isOnline) return null;

  const formatted = lastOnlineAt?.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.labelRoot}>
      <View style={styles.labelRow}>
        <WifiOff color="#fff" size={20} />
        <Text style={styles.labelText}>No Internet Connection</Text>
      </View>
      <Text style={styles.labelTextSecondary}>Last online: {formatted}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Banner
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  bannerTextSecondary: {
    fontSize: 13,
    color: '#fff',
  },

  // Offline Label
  labelRoot: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  labelTextSecondary: {
    fontSize: 13,
    color: '#fff',
  },
});

import { getDefaultHeaderHeight, useHeaderHeight } from '@react-navigation/elements';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * `useHeaderHeight` from `@react-navigation/elements` is unreliable on Android under
 * edge-to-edge (native-stack's header-height callback has open upstream bugs — see
 * react-native-screens#2661/#3040, react-navigation#12692, expo/expo#36685). Fall back
 * to `getDefaultHeaderHeight`'s deterministic calculation on Android, which only needs
 * the top safe-area inset there and doesn't depend on that native round trip.
 */
export function useReliableHeaderHeight(modalPresentation = false) {
  const nativeHeaderHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();

  if (Platform.OS === 'android') {
    return getDefaultHeaderHeight(layout, modalPresentation, insets.top);
  }

  return nativeHeaderHeight;
}

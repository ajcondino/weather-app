import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ListIcon, MapIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function LocationFooter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={40}
      tint="systemMaterial"
      style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}
    >
      <Pressable onPress={() => router.push('/')}>
        <MapIcon color="#fff" />
      </Pressable>
      <Pressable onPress={() => router.push('/location')}>
        <ListIcon color="#fff" />
      </Pressable>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 28,
  },
});

import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ListIcon, SettingsIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageDots } from './PageDots';

interface LocationFooterProps {
  count: number;
  activeIndex: number;
}

export function LocationFooter({ count, activeIndex }: LocationFooterProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={40}
      tint="systemMaterial"
      style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}
    >
      <Pressable onPress={() => router.push('/location')}>
        <ListIcon color="#fff" size={28} strokeWidth={1.2} />
      </Pressable>

      <PageDots count={count} activeIndex={activeIndex} />

      <Pressable onPress={() => router.push('/settings')}>
        <SettingsIcon color="#fff" size={28} strokeWidth={1.2} />
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
    paddingTop: 10,
    paddingHorizontal: 28,
  },
});

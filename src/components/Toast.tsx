import { useToastStore } from '#/store/toastStore';
import { TriangleAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AUTO_DISMISS_MS = 4000;

export function Toast() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(hide, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [message, hide]);

  if (!message) return null;

  return (
    <View style={[styles.root, { bottom: insets.bottom + 16 }]}>
      <TriangleAlert color="#FF6B6B" size={16} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

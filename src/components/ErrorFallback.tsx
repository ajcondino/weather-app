import { TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <TriangleAlert color="#FF6B6B" size={48} />
        <Text style={styles.title}>{t('errors.genericTitle')}</Text>
        <Text style={styles.subtitle}>{error.message}</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            console.log('Retrying');
            onRetry();
          }}
        >
          <Text style={styles.buttonText}>{t('errors.tryAgain')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

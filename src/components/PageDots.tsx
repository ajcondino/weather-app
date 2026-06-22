import { StyleSheet, View } from 'react-native';

interface PageDotsProps {
  count: number;
  activeIndex: number;
}

export function PageDots({ count, activeIndex }: PageDotsProps) {
  if (count <= 1) return null;

  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
});

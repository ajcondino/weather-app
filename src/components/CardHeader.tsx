import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

interface CardHeaderProps {
  title: string;
  style?: StyleProp<TextStyle>;
}

export function CardHeader({ title, style }: CardHeaderProps) {
  return <Text style={[styles.title, style]}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

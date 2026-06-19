import { WeatherCondition } from '#/api/types';
import { getSkyGradient } from '#/themes/skyGradient';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

interface SkyBackgroundProps {
  condition?: WeatherCondition;
  isDay?: boolean;
}

/**
 * Fills its parent with a vertical sky gradient derived from the current
 * weather condition and time of day. Meant to sit as the first/bottom-most
 * child in a card, with weather content layered on top via absolute fill
 * or by being a later sibling.
 */
export function SkyBackground({ condition = 'clear', isDay = true }: SkyBackgroundProps) {
  const colors = getSkyGradient(condition, isDay);

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

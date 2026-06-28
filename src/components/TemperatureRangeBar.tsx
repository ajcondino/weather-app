import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

interface TemperatureRangeBarProps {
  /** This day's low/high */
  minTempC: number;
  maxTempC: number;
  /** The whole week's low/high */
  weekMinC: number;
  weekMaxC: number;
  /** Today's current temperature */
  currentTempC?: number;
  width?: number;
}

export function TemperatureRangeBar({
  minTempC,
  maxTempC,
  weekMinC,
  weekMaxC,
  currentTempC,
  width = 100,
}: TemperatureRangeBarProps) {
  const weekSpan = weekMaxC - weekMinC || 1; // guard divide-by-zero on a flat week

  const toFraction = (t: number) => (t - weekMinC) / weekSpan;

  const startFraction = toFraction(minTempC);
  const endFraction = toFraction(maxTempC);

  const left = startFraction * width;
  const segmentWidth = Math.max((endFraction - startFraction) * width, 4); // never fully collapse

  const showDot = currentTempC !== undefined;
  const dotLeft = showDot ? toFraction(currentTempC) * width : 0;

  return (
    <View style={[styles.track, { width }]}>
      <View style={[styles.segmentWrapper, { left, width: segmentWidth }]}>
        <LinearGradient
          colors={['#4FA8E8', '#F2A623']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {showDot && <View style={[styles.dot, { left: dotLeft - 4 }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'visible', // the dot is allowed to sit slightly outside the track
  },
  segmentWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
});

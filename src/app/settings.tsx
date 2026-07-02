import { useNotificationsStore } from '#/store/notificationsStore';
import { useUnitsStore } from '#/store/unitsStore';
import { formatTemp } from '#/utils/temperature';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsModal() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const unit = useUnitsStore((s) => s.unit);
  const toggleUnit = useUnitsStore((s) => s.toggleUnit);
  const toggleNotification = useNotificationsStore((s) => s.toggle);
  const enabled = useNotificationsStore((s) => s.enabled);

  function onDone() {
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerTitleStyle: { color: '#fff' },
          headerRight: () => (
            <Pressable onPress={onDone} hitSlop={12}>
              <Text style={styles.doneButton}>Done</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.root}>
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: headerHeight + 16 }]}>
          {/* Units section */}
          <Text style={styles.sectionTitle}>Units</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>Temperature</Text>
                <Text style={styles.rowValue}>
                  {unit === 'C' ? 'Celsius' : 'Fahrenheit'} (
                  {formatTemp(0, unit).replace('0', '').trim()})
                </Text>
              </View>
              <View style={styles.segmentedControl}>
                <Pressable
                  style={[styles.segment, styles.segmentLeft, unit === 'C' && styles.segmentActive]}
                  onPress={() => unit !== 'C' && toggleUnit()}
                >
                  <Text style={[styles.segmentText, unit === 'C' && styles.segmentTextActive]}>
                    °C
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.segment,
                    styles.segmentRight,
                    unit === 'F' && styles.segmentActive,
                  ]}
                  onPress={() => unit !== 'F' && toggleUnit()}
                >
                  <Text style={[styles.segmentText, unit === 'F' && styles.segmentTextActive]}>
                    °F
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <Text style={styles.sectionFooter}>Applied to all locations across the app.</Text>

          {/* Notifications section */}
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Weather Alerts</Text>
              <Switch
                value={enabled}
                onValueChange={toggleNotification}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#4FA8E8' }}
                thumbColor="#fff"
              />
            </View>
          </View>
          <Text style={styles.sectionFooter}>
            Receive alerts for severe weather conditions in your saved locations.
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 12,
    marginTop: 28,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionFooter: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#fff',
  },
  rowValue: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  segmentLeft: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  segmentRight: {},
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  segmentText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});

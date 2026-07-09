import { MAX_SUBSCRIPTIONS, useNotificationsStore } from '#/store/notificationsStore';
import { useUnitsStore } from '#/store/unitsStore';
import { formatTemp } from '#/utils/temperature';
import { useAuth, useUser } from '@clerk/expo';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';
import { BellOffIcon, LogOutIcon, UserIcon } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsModal() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { signOut } = useAuth();
  const { user } = useUser();

  const unit = useUnitsStore((s) => s.unit);
  const toggleUnit = useUnitsStore((s) => s.toggleUnit);
  const notificationsEnabled = useNotificationsStore((s) => s.enabled);
  const toggleNotifications = useNotificationsStore((s) => s.toggle);
  const subscribedLocations = useNotificationsStore((s) => s.subscribedLocations);
  const unsubscribeLocation = useNotificationsStore((s) => s.unsubscribeLocation);

  function onDone() {
    router.back();
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/sign-in');
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
          {/* Profile section */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.profileLeft}>
                <View style={styles.avatar}>
                  <UserIcon color="rgba(255,255,255,0.7)" size={20} />
                </View>
                <View>
                  <Text style={styles.profileName}>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : (user?.firstName ?? 'Account')}
                  </Text>
                  <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
                </View>
              </View>
            </View>
          </View>

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
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#4FA8E8' }}
                thumbColor="#fff"
              />
            </View>
          </View>
          <Text style={styles.sectionFooter}>
            Receive alerts for severe weather conditions in your saved locations.
          </Text>

          {/* Subscribed locations section — only shown when notifications are on */}
          {notificationsEnabled && (
            <>
              <Text style={styles.sectionTitle}>
                Alert Locations ({subscribedLocations.length}/{MAX_SUBSCRIPTIONS})
              </Text>
              <View style={styles.card}>
                {subscribedLocations.length === 0 ? (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>
                      No locations subscribed. Swipe right on a saved location to subscribe.
                    </Text>
                  </View>
                ) : (
                  subscribedLocations.map((location, i) => (
                    <View
                      key={`${location.lat},${location.lon}`}
                      style={[styles.row, i === subscribedLocations.length - 1 && styles.rowLast]}
                    >
                      <Text style={styles.rowLabel}>{location.name}</Text>
                      <Pressable
                        onPress={() => unsubscribeLocation(location.lat, location.lon)}
                        hitSlop={12}
                      >
                        <BellOffIcon color="rgba(255,255,255,0.5)" size={18} />
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
              <Text style={styles.sectionFooter}>
                Tap the bell icon to remove a location from alerts.
              </Text>
            </>
          )}

          {/* Sign out */}
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <LogOutIcon color="#FF6B6B" size={18} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
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
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  profileEmail: {
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
  emptyRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 20,
  },
  rowLast: {
    borderBottomWidth: 0,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.2)',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});

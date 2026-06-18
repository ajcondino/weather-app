import { ScrollView, StyleSheet, Text } from 'react-native';

import { Link, useLocalSearchParams } from 'expo-router';

// This screen is for locations that are stored in async storage and accessed from the "Saved Locations" screen.
// It is not currently used in the app, but it is a placeholder for future functionality.
export default function WeatherDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>
        {id} <Link href="/location">Settings</Link>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { useLocation } from '#/hooks/useLocation';

export default function Index() {
  const { location, error } = useLocation();

  let text = 'Waiting...';
  if (error) {
    text = error;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{text}</Text>
      <Text style={styles.paragraph}>{location?.name}</Text>
    </View>
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

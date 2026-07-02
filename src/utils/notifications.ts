import * as Notifications from 'expo-notifications';

export async function scheduleWeatherAlerts(): Promise<void> {
  // Clear old scheduled alerts before rescheduling
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weather Alert',
      body: 'Severe weather conditions are expected in your area. Stay safe!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10, // For testing purposes, trigger after 10 seconds
      repeats: false,
    },
  });
}

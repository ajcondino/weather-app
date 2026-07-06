import { DailyForecast, Location, WeatherCondition } from '#/api/types';
import * as Notifications from 'expo-notifications';

const ALERT_CONDITIONS: WeatherCondition[] = ['rain', 'thunderstorm', 'drizzle', 'snow', 'fog'];

const ALERT_HOUR = 13;

export async function scheduleWeatherAlerts(
  location: Location,
  daily: DailyForecast[],
): Promise<void> {
  const now = new Date();

  for (const forecast of daily) {
    if (!ALERT_CONDITIONS.includes(forecast.condition)) continue;

    const alertDate = getAlertDate(forecast);

    // Skip if the alert date is in the past
    if (alertDate <= now) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Weather Alert for ${location.name}`,
        body: getAlertBody(forecast),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alertDate,
      },
    });
  }
}

export async function scheduleAllWeatherAlerts(
  subscriptions: { location: Location; daily: DailyForecast[] }[],
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Promise.all(
    subscriptions.map(({ location, daily }) => scheduleWeatherAlerts(location, daily)),
  );
}

function getAlertBody(forecast: DailyForecast): string {
  const parts: string[] = [];

  if (forecast.precipitationProbabilityMax >= 70) {
    parts.push(`${Math.round(forecast.precipitationProbabilityMax)}% chance of precipitation`);
  }

  if (forecast.precipitationMm > 0) {
    parts.push(`${forecast.precipitationMm.toFixed(1)}mm expected`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Check the forecast for details';
}

function getAlertDate(day: DailyForecast): Date {
  const date = new Date(day.date);
  date.setHours(ALERT_HOUR, 47, 0, 0);
  return date;
}

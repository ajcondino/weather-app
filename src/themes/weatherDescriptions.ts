import { WeatherCondition } from '#/api/types';

export const WEATHER_DESCRIPTIONS: Record<WeatherCondition, string> = {
  clear: 'Clear',
  partly_cloudy: 'Partly Cloudy',
  overcast: 'Cloudy',
  fog: 'Foggy',
  drizzle: 'Drizzle',
  rain: 'Rain',
  snow: 'Snow',
  thunderstorm: 'Thunderstorms',
};

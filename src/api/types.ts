export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Location extends Coordinates {
  name: string;
  country: string;
  countryCode: string;
  state?: string;
}

export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface CurrentWeather {
  location: Location;
  condition: WeatherCondition;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedKph: number;
  uvIndex: number;
  isDay: boolean;
  observedAt: string;

  /** Next 24 hours, on one entry per hour. */
  hourly: HourlyForecast[];

  /** 8-day daily forecast. days[0] is today - use for H/L */
  daily: DailyForecast[];
}

export interface HourlyForecast {
  time: string;
  condition: WeatherCondition;
  temperatureC: number;
  precipitationMm: number;
  isDay: boolean;
}

export interface DailyForecast {
  date: string;
  condition: WeatherCondition;
  maxTempC: number;
  minTempC: number;
  precipitationMm: number;
  /** Max chance of rain for the day */
  precipitationProbabilityMax: number;
  uvIndex: number;
}

export type TemperatureUnit = 'C' | 'F';

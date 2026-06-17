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
}

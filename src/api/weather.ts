import { request } from './http';
import { Coordinates, CurrentWeather, WeatherCondition } from './types';

// https://meteo.com/en/docs#weather_variable_documentation
const WMO_CODE_MAP: Record<number, WeatherCondition> = {
  0: 'clear',
  1: 'clear',
  2: 'partly_cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm',
};

function toCondition(code: number): WeatherCondition {
  return WMO_CODE_MAP[code] ?? 'clear';
}

interface OpenMeteoCurrentResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    uv_index: number;
    is_day: number;
    weather_code: number;
  };
}

/**
 * Fetches current conditions for a coordinate pair.
 * The `location` field is pre-populated by the caller (from geocoding)
 */
export async function getCurrentWeather(
  coords: Coordinates,
  location: CurrentWeather['location'],
): Promise<CurrentWeather> {
  const data = await request<OpenMeteoCurrentResponse>('/forecast', {
    params: {
      latitude: coords.lat,
      longitude: coords.lon,
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'wind_speed_10m',
        'uv_index',
        'is_day',
        'weather_code',
      ].join(','),
      wind_speed_unit: 'kmh',
    },
  });

  const c = data.current;

  return {
    location,
    condition: toCondition(c.weather_code),
    temperatureC: c.temperature_2m,
    feelsLikeC: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeedKph: c.wind_speed_10m,
    uvIndex: c.uv_index,
    isDay: c.is_day === 1,
    observedAt: c.time,
  };
}

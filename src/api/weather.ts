import { request } from './http';
import {
  Coordinates,
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  WeatherCondition,
} from './types';

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

interface OpenMeteoResponse {
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
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
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
  const data = await request<OpenMeteoResponse>('/forecast', {
    params: {
      latitude: coords.lat,
      longitude: coords.lon,

      // Current conditions
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'wind_speed_10m',
        'uv_index',
        'is_day',
        'weather_code',
      ].join(','),

      // Hourly - next 24 hours only
      hourly: ['temperature_2m', 'weather_code', 'precipitation', 'is_day'].join(','),
      forecast_hours: 24,

      // Daily - 10 days
      // Actually, as per Eric's AC it should be 8-days but I'm cloning ios weather app, that's why :)
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'uv_index_max',
      ].join(','),
      forecast_days: 10,

      wind_speed_unit: 'kmh',
    },
  });

  const c = data.current;
  const h = data.hourly;
  const d = data.daily;

  const current = {
    condition: toCondition(c.weather_code),
    temperatureC: c.temperature_2m,
    feelsLikeC: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeedKph: c.wind_speed_10m,
    uvIndex: c.uv_index,
    isDay: c.is_day === 1,
    observedAt: c.time,
  };

  const hourly: HourlyForecast[] = h.time.map((time, i) => {
    const weatherCode = h.weather_code[i];
    const temperature = h.temperature_2m[i];
    const precipitation = h.precipitation[i];
    const isDay = h.is_day[i];

    if (
      weatherCode === undefined ||
      temperature === undefined ||
      precipitation === undefined ||
      isDay === undefined
    ) {
      throw new Error(`Invalid hourly forecast data at index ${i}`);
    }

    return {
      time,
      condition: toCondition(weatherCode),
      temperatureC: temperature,
      precipitationMm: precipitation,
      isDay: isDay === 1,
    };
  });

  const daily: DailyForecast[] = d.time.map((date, i) => {
    const weatherCode = d.weather_code[i];
    const maxTemp = d.temperature_2m_max[i];
    const minTemp = d.temperature_2m_min[i];
    const precipitation = d.precipitation_sum[i];
    const precipitationProbability = d.precipitation_probability_max[i];
    const uvIndex = d.uv_index_max[i];

    if (
      weatherCode === undefined ||
      maxTemp === undefined ||
      minTemp === undefined ||
      precipitation === undefined ||
      precipitationProbability === undefined ||
      uvIndex === undefined
    ) {
      throw new Error(`Invalid daily forecast data at index ${i}`);
    }

    return {
      date,
      condition: toCondition(weatherCode),
      maxTempC: maxTemp,
      minTempC: minTemp,
      precipitationMm: precipitation,
      precipitationProbabilityMax: precipitationProbability,
      uvIndex,
    };
  });

  return {
    location,
    ...current,
    hourly,
    daily,
  };
}

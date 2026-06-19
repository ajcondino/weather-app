import type { WeatherCondition } from '#/api/types';

export interface WeatherVisualConfig {
  /** 0-1, how much the sky gradient desaturates toward gray */
  overcastAmount: number;
  /** Cloud sprite density on screen */
  cloudDensity: 'none' | 'low' | 'medium' | 'high';
  /** Which particle system to run, if any */
  particle: 'none' | 'rain' | 'snow' | 'drizzle' | 'lightning' | 'fog';
  /** Weather the sun/moon disc should render at all */
  showCelestialBody: boolean;
}

export const WEATHER_VISUALS: Record<WeatherCondition, WeatherVisualConfig> = {
  clear: {
    overcastAmount: 0,
    cloudDensity: 'none',
    particle: 'none',
    showCelestialBody: true,
  },
  partly_cloudy: {
    overcastAmount: 0.2,
    cloudDensity: 'low',
    particle: 'none',
    showCelestialBody: true,
  },
  overcast: {
    overcastAmount: 0.7,
    cloudDensity: 'high',
    particle: 'none',
    showCelestialBody: false,
  },
  fog: {
    overcastAmount: 0.5,
    cloudDensity: 'medium',
    particle: 'fog',
    showCelestialBody: false,
  },
  drizzle: {
    overcastAmount: 0.6,
    cloudDensity: 'high',
    particle: 'drizzle',
    showCelestialBody: false,
  },
  rain: {
    overcastAmount: 0.8,
    cloudDensity: 'high',
    particle: 'rain',
    showCelestialBody: false,
  },
  snow: {
    overcastAmount: 0.6,
    cloudDensity: 'high',
    particle: 'snow',
    showCelestialBody: false,
  },
  thunderstorm: {
    overcastAmount: 0.9,
    cloudDensity: 'high',
    particle: 'lightning',
    showCelestialBody: false,
  },
};

import { WeatherCondition } from '#/api/types';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from 'lucide-react-native';

export function getWeatherIcon(condition: WeatherCondition, isDay: boolean) {
  switch (condition) {
    case 'clear':
      return isDay ? Sun : Moon;
    case 'partly_cloudy':
      return isDay ? CloudSun : CloudMoon;
    case 'overcast':
      return Cloud;
    case 'fog':
      return CloudFog;
    case 'drizzle':
      return CloudDrizzle;
    case 'rain':
      return CloudRain;
    case 'snow':
      return CloudSnow;
    case 'thunderstorm':
      return CloudLightning;
  }
}

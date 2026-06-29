import { TemperatureUnit } from '#/api/types';

/**
 * Converts Celsius to Fahrenheight
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Format a Celsius value for display in the current unit
 * Always pass Celsius - this function handles conversion internally
 */
export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  const value = unit === 'F' ? celsiusToFahrenheit(celsius) : celsius;

  return `${Math.round(value)}°`;
}

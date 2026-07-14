import { celsiusToFahrenheit, formatTemp } from '../temperature';

describe('celsiusToFahrenheit', () => {
  it('converts 0°C to 32°F', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it('converts 100°C to 212°F', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('converts negative temperatures correctly', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40); // -40 is the same in both scales!
  });

  it('handles decimal values', () => {
    expect(celsiusToFahrenheit(37.5)).toBeCloseTo(99.5);
  });
});

describe('formatTemp', () => {
  it('formats Celsius values with a degree symbol', () => {
    expect(formatTemp(20, 'C')).toBe('20°');
  });

  it('formats Fahrenheit values by converting first', () => {
    expect(formatTemp(0, 'F')).toBe('32°');
  });

  it('rounds decimal values to the nearest whole number', () => {
    expect(formatTemp(20.6, 'C')).toBe('21°');
    expect(formatTemp(20.4, 'C')).toBe('20°');
  });

  it('rounds correctly after Fahrenheit conversion', () => {
    // 37°C = 98.6°F, should round to 99°
    expect(formatTemp(37, 'F')).toBe('99°');
  });
});

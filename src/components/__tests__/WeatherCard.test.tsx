import type { Location } from '#/api/types';
import { useCurrentWeather } from '#/hooks/useWeather';
import { render } from '@testing-library/react-native';
import { WeatherCard } from '../WeatherCard';

// Mock the data-fetching hook - we control exactly what it returns per test,
// instead of dealing with real network calls / async loading states.
jest.mock('#/hooks/useWeather', () => ({
  useCurrentWeather: jest.fn(),
}));

// Mock child components as simple stand-ins with a testID, so we can assert
// "was this rendered or not" without depending on their internals.
jest.mock('../SkyBackground', () => ({
  SkyBackground: () => null,
}));
jest.mock('../WeatherHeader', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../HourlyForecastCard', () => {
  const { Text } = require('react-native');
  return {
    HourlyForecastCard: () => <Text testID="hourly-forecast">Hourly</Text>,
  };
});
jest.mock('../DailyForecastCard', () => {
  const { Text } = require('react-native');
  return {
    DailyForecastCard: () => <Text testID="daily-forecast">Daily</Text>,
  };
});

const mockUseCurrentWeather = useCurrentWeather as jest.Mock;

const location: Location = { lat: 14.5995, lon: 120.9842, name: 'Manila' } as Location;

const weatherWithData = {
  condition: 'clear',
  isDay: true,
  temperatureC: 28,
  hourly: [{ time: '12:00' }],
  daily: [{ date: '2026-07-14' }],
};

describe('WeatherCard', () => {
  beforeEach(() => {
    mockUseCurrentWeather.mockReset();
  });

  it('renders nothing extra while weather data is loading', async () => {
    mockUseCurrentWeather.mockReturnValue({ data: undefined });

    const { queryByTestId } = await render(<WeatherCard location={location} />);

    expect(queryByTestId('hourly-forecast')).toBeNull();
    expect(queryByTestId('daily-forecast')).toBeNull();
  });

  it('renders both forecast sections once weather data arrives', async () => {
    mockUseCurrentWeather.mockReturnValue({ data: weatherWithData });

    const { getByTestId } = await render(<WeatherCard location={location} />);

    expect(getByTestId('hourly-forecast')).toBeTruthy();
    expect(getByTestId('daily-forecast')).toBeTruthy();
  });

  it('hides the hourly section when the hourly array is empty', async () => {
    mockUseCurrentWeather.mockReturnValue({
      data: { ...weatherWithData, hourly: [] },
    });

    const { queryByTestId, getByTestId } = await render(<WeatherCard location={location} />);

    expect(queryByTestId('hourly-forecast')).toBeNull();
    expect(getByTestId('daily-forecast')).toBeTruthy();
  });

  it('hides the daily section when the daily array is empty', async () => {
    mockUseCurrentWeather.mockReturnValue({
      data: { ...weatherWithData, daily: [] },
    });

    const { queryByTestId, getByTestId } = await render(<WeatherCard location={location} />);

    expect(getByTestId('hourly-forecast')).toBeTruthy();
    expect(queryByTestId('daily-forecast')).toBeNull();
  });

  it('passes null coordinates to the hook when no location is selected', async () => {
    mockUseCurrentWeather.mockReturnValue({ data: undefined });

    await render(<WeatherCard location={null} />);

    expect(mockUseCurrentWeather).toHaveBeenCalledWith(null, null);
  });

  it('passes lat/lon to the hook when a location is selected', async () => {
    mockUseCurrentWeather.mockReturnValue({ data: undefined });

    await render(<WeatherCard location={location} />);

    expect(mockUseCurrentWeather).toHaveBeenCalledWith(
      { lat: location.lat, lon: location.lon },
      location,
    );
  });
});

import { render, screen } from '@testing-library/react';
import { WeatherPanel } from './WeatherPanel';
import type { Weather } from '../model/weather.types';

const mockWeather: Weather = {
  latitude: 52.23,
  longitude: 21.01,
  temperature: 20.5,
  humidity: 60,
  pressure: 1013,
  windSpeed: 12.3,
  windDirection: 180,
  fetchedAt: '2024-05-04T12:00',
};

describe('WeatherPanel', () => {
  it('renders temperature card', () => {
    render(<WeatherPanel weather={mockWeather} />);
    expect(screen.getByText('20.5 °C')).toBeInTheDocument();
  });

  it('renders humidity card', () => {
    render(<WeatherPanel weather={mockWeather} />);
    expect(screen.getByText('60 %')).toBeInTheDocument();
  });

  it('renders pressure card', () => {
    render(<WeatherPanel weather={mockWeather} />);
    expect(screen.getByText('1013 hPa')).toBeInTheDocument();
  });

  it('renders wind speed card', () => {
    render(<WeatherPanel weather={mockWeather} />);
    expect(screen.getByText('12.3 km/h')).toBeInTheDocument();
  });

  it('shows Open-Meteo attribution link', () => {
    render(<WeatherPanel weather={mockWeather} />);
    const link = screen.getByRole('link', { name: /open-meteo/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://open-meteo.com');
  });
});

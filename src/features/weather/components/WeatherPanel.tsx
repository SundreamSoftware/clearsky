import type { Weather } from '../model/weather.types';
import { WeatherCard } from './WeatherCard';

interface WeatherPanelProps {
  weather: Weather;
}

function windDirectionLabel(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

export function WeatherPanel({ weather }: WeatherPanelProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <WeatherCard
          icon="🌡️"
          label="Temperatura"
          value={`${weather.temperature.toFixed(1)} °C`}
        />
        <WeatherCard icon="💧" label="Wilgotność" value={`${weather.humidity} %`} />
        <WeatherCard
          icon="🔽"
          label="Ciśnienie"
          value={`${weather.pressure.toFixed(0)} hPa`}
        />
        <WeatherCard
          icon="💨"
          label="Prędkość wiatru"
          value={`${weather.windSpeed.toFixed(1)} km/h`}
        />
        <WeatherCard
          icon="🧭"
          label="Kierunek wiatru"
          value={`${windDirectionLabel(weather.windDirection)} (${weather.windDirection}°)`}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Pogoda:{' '}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          Open-Meteo
        </a>
      </p>
    </div>
  );
}

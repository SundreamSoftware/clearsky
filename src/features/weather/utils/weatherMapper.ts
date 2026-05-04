import type { OpenMeteoCurrentDto, OpenMeteoHourlyDto } from '../api/openMeteo.dto';
import type { Weather } from '../model/weather.types';

export function mapOpenMeteoCurrentDto(dto: OpenMeteoCurrentDto): Weather {
  return {
    latitude: dto.latitude,
    longitude: dto.longitude,
    temperature: dto.current.temperature_2m,
    humidity: dto.current.relative_humidity_2m,
    pressure: dto.current.surface_pressure,
    windSpeed: dto.current.wind_speed_10m,
    windDirection: dto.current.wind_direction_10m,
    fetchedAt: dto.current.time,
  };
}

export interface WeatherHistory {
  time: string[];
  temperature: (number | null)[];
  humidity: (number | null)[];
  windSpeed: (number | null)[];
}

export function mapOpenMeteoHourlyDto(dto: OpenMeteoHourlyDto): WeatherHistory {
  return {
    time: dto.hourly.time,
    temperature: dto.hourly.temperature_2m,
    humidity: dto.hourly.relative_humidity_2m,
    windSpeed: dto.hourly.wind_speed_10m,
  };
}

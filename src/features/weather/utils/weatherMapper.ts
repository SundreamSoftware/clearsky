import type { OpenMeteoCurrentDto } from '../api/openMeteo.dto';
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

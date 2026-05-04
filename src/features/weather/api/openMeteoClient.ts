import { createHttpClient } from '@/shared/api/createHttpClient';
import { OpenMeteoCurrentSchema } from './openMeteo.schemas';
import type { OpenMeteoCurrentDto } from './openMeteo.dto';

const forecastClient = createHttpClient('https://api.open-meteo.com/v1');

export const openMeteoClient = {
  async getCurrentWeather(lat: number, lon: number): Promise<OpenMeteoCurrentDto> {
    const params = `forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&forecast_days=1`;
    const raw = await forecastClient.get<unknown>(params);
    return OpenMeteoCurrentSchema.parse(raw);
  },
};

import { createHttpClient } from '@/shared/api/createHttpClient';
import { OpenMeteoCurrentSchema, OpenMeteoHourlySchema } from './openMeteo.schemas';
import type { OpenMeteoCurrentDto, OpenMeteoHourlyDto } from './openMeteo.dto';

const forecastClient = createHttpClient('https://api.open-meteo.com/v1');
const archiveClient = createHttpClient('https://archive-api.open-meteo.com/v1');

export const openMeteoClient = {
  async getCurrentWeather(lat: number, lon: number): Promise<OpenMeteoCurrentDto> {
    const params = `forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&forecast_days=1`;
    const raw = await forecastClient.get<unknown>(params);
    return OpenMeteoCurrentSchema.parse(raw);
  },

  async getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string,
  ): Promise<OpenMeteoHourlyDto> {
    const params = `archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh`;
    const raw = await archiveClient.get<unknown>(params);
    return OpenMeteoHourlySchema.parse(raw);
  },
};

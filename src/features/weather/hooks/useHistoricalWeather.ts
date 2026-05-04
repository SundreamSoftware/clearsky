import { useQuery } from '@tanstack/react-query';
import { openMeteoClient } from '../api/openMeteoClient';
import { mapOpenMeteoHourlyDto } from '../utils/weatherMapper';
import type { WeatherHistory } from '../utils/weatherMapper';

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDateRange(range: '24h' | '7d'): { startDate: string; endDate: string } {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const startDate = new Date(yesterday);
  if (range === '7d') {
    startDate.setDate(yesterday.getDate() - 6);
  }

  return {
    startDate: toISODate(startDate),
    endDate: toISODate(yesterday),
  };
}

export function useHistoricalWeather(
  lat: number | null,
  lon: number | null,
  range: '24h' | '7d',
) {
  const { startDate, endDate } = getDateRange(range);

  return useQuery<WeatherHistory>({
    queryKey: ['weather-history', lat, lon, range],
    queryFn: async () => {
      const dto = await openMeteoClient.getHistoricalWeather(lat!, lon!, startDate, endDate);
      return mapOpenMeteoHourlyDto(dto);
    },
    enabled: lat !== null && lon !== null,
    staleTime: 30 * 60 * 1000,
  });
}

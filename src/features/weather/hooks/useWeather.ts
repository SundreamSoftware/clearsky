import { useQuery } from '@tanstack/react-query';
import { openMeteoClient } from '../api/openMeteoClient';
import { mapOpenMeteoCurrentDto } from '../utils/weatherMapper';
import type { Weather } from '../model/weather.types';

export function useWeather(lat: number | null, lon: number | null) {
  return useQuery<Weather>({
    queryKey: ['weather', lat, lon],
    queryFn: async () => {
      const dto = await openMeteoClient.getCurrentWeather(lat!, lon!);
      return mapOpenMeteoCurrentDto(dto);
    },
    enabled: lat !== null && lon !== null,
    staleTime: 15 * 60 * 1000,
  });
}

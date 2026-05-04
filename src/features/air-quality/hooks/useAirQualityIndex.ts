import { useQuery } from '@tanstack/react-query';
import { giosClient } from '../api/giosClient';
import { mapAqiDto } from '../utils/airQualityIndexMapper';

export function useAirQualityIndex(stationId: number | null) {
  return useQuery({
    queryKey: ['aqindex', stationId],
    queryFn: async () => {
      const dto = await giosClient.getAirQualityIndex(stationId!);
      return mapAqiDto(dto);
    },
    enabled: stationId !== null,
    staleTime: 5 * 60 * 1000,
  });
}

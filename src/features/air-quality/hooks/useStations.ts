import { useQuery } from '@tanstack/react-query';
import { giosClient } from '../api/giosClient';
import { mapStationListDto } from '../utils/stationMapper';

export function useStations(enabled = true) {
  return useQuery({
    queryKey: ['stations'],
    enabled,
    queryFn: async () => {
      const dtos = await giosClient.getStations();
      return mapStationListDto(dtos);
    },
    staleTime: 10 * 60 * 1000,
  });
}

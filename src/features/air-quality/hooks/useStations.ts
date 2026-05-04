import { useQuery } from '@tanstack/react-query';
import { giosClient } from '../api/giosClient';
import { mapStationListDto } from '../utils/stationMapper';

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const dtos = await giosClient.getStations();
      return mapStationListDto(dtos);
    },
    staleTime: 10 * 60 * 1000,
  });
}

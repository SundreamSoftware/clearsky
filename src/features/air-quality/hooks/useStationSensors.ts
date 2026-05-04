import { useQuery } from '@tanstack/react-query';
import { giosClient } from '../api/giosClient';
import { mapSensorListDto } from '../utils/sensorMapper';

export function useStationSensors(stationId: number | null) {
  return useQuery({
    queryKey: ['sensors', stationId],
    queryFn: async () => {
      const dtos = await giosClient.getSensors(stationId!);
      return mapSensorListDto(dtos, stationId!);
    },
    enabled: stationId !== null,
    staleTime: 10 * 60 * 1000,
  });
}

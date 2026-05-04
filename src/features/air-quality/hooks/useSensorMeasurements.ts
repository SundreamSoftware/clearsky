import { useQuery } from '@tanstack/react-query';
import { giosClient } from '../api/giosClient';
import { mapMeasurementsDto } from '../utils/measurementMapper';

export function useSensorMeasurements(
  sensorId: number | null,
  paramCode = '',
  range: '24h' | '7d' = '24h',
) {
  return useQuery({
    queryKey: ['measurements', sensorId, range],
    queryFn: async () => {
      const dto = await giosClient.getMeasurements(sensorId!);
      return mapMeasurementsDto(dto, sensorId!, paramCode);
    },
    enabled: sensorId !== null,
    staleTime: 2 * 60 * 1000,
  });
}

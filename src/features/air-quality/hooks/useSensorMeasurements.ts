import { useQuery } from '@tanstack/react-query';
import { giosClient } from '../api/giosClient';
import { mapMeasurementsDto } from '../utils/measurementMapper';

export function useSensorMeasurements(sensorId: number | null) {
  return useQuery({
    queryKey: ['measurements', sensorId],
    queryFn: async () => {
      const dto = await giosClient.getMeasurements(sensorId!);
      return mapMeasurementsDto(dto, sensorId!);
    },
    enabled: sensorId !== null,
    staleTime: 2 * 60 * 1000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { giosClient } from '../api/giosClient';
import { mapMeasurementsDto } from '../utils/measurementMapper';
import { ApiRequestError } from '@/shared/api/apiError';

export function useSensorMeasurements(
  sensorId: number | null,
  paramCode = '',
  range: '24h' | '7d' = '24h',
) {
  return useQuery({
    queryKey: ['measurements', sensorId, range],
    queryFn: async () => {
      try {
        const dto = await giosClient.getMeasurements(sensorId!);
        return mapMeasurementsDto(dto, sensorId!, paramCode);
      } catch (err) {
        // GIOŚ returns 400 for manual stations — measurements are uploaded 4-8 weeks later
        if (err instanceof ApiRequestError && err.statusCode === 400) {
          return [];
        }
        throw err;
      }
    },
    enabled: sensorId !== null,
    staleTime: 2 * 60 * 1000,
  });
}

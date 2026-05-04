import { useQuery } from '@tanstack/react-query';
import { openAqClient } from '../api/openAqClient';
import type { Station } from '../model/station.types';
import type { AirQualityIndex } from '../model/airQualityIndex.types';
import { pm25ToAqiLevel, getAqiInfo } from '../utils/airQualityScale';

export function useOpenAqAqi(station: Station | null) {
  const pm25SensorId = station?.sensorIds?.pm25 ?? null;

  return useQuery({
    queryKey: ['aqindex', 'openaq', station?.id],
    queryFn: async (): Promise<AirQualityIndex> => {
      const measurements = await openAqClient.getLatestMeasurements(pm25SensorId!);
      const latest = measurements[0];
      const value = latest?.value ?? null;
      const indexLevel = value !== null ? pm25ToAqiLevel(value) : null;
      const indexName = indexLevel !== null ? getAqiInfo(indexLevel).name : null;

      return {
        stationId: station!.id,
        indexLevel,
        indexName,
        calculatedAt: latest?.period?.datetimeTo?.utc ?? null,
        sourceDataDate: null,
      };
    },
    enabled: station !== null && station.source === 'openaq' && pm25SensorId !== null,
    staleTime: 5 * 60 * 1000,
  });
}

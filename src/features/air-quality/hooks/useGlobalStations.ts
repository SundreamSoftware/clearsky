import { useQuery } from '@tanstack/react-query';
import { waqiClient } from '../api/waqiClient';
import type { WaqiBounds } from '../api/waqiClient';
import { mapWaqiBoundsStationsToStations } from '../utils/waqiStationMapper';

export type MapBounds = WaqiBounds;

export function useGlobalStations(bounds: MapBounds | null) {
  return useQuery({
    queryKey: ['stations', 'waqi', bounds],
    queryFn: async () => {
      const dtos = await waqiClient.getLocationsByBounds(bounds!);
      return mapWaqiBoundsStationsToStations(dtos);
    },
    enabled: bounds !== null,
    staleTime: 5 * 60 * 1000,
  });
}

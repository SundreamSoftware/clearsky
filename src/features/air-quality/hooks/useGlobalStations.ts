import { useQuery } from '@tanstack/react-query';
import { openAqClient } from '../api/openAqClient';
import type { OpenAqBbox } from '../api/openAqClient';
import { mapOpenAqLocationsToStations } from '../utils/openAqStationMapper';

export type MapBounds = OpenAqBbox;

export function useGlobalStations(bounds: MapBounds | null) {
  return useQuery({
    queryKey: ['stations', 'openaq', bounds],
    queryFn: async () => {
      const dtos = await openAqClient.getLocationsByBbox(bounds!);
      return mapOpenAqLocationsToStations(dtos);
    },
    enabled: bounds !== null,
    staleTime: 5 * 60 * 1000,
  });
}

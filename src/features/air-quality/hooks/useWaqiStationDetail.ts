import { useQuery } from '@tanstack/react-query';
import { waqiClient } from '../api/waqiClient';
import type { Station } from '../model/station.types';
import type { WaqiFeedDataDto } from '../api/waqi.dto';

function getWaqiUid(station: Station): number | null {
  const match = station.id.match(/^waqi-(-?\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export function useWaqiStationDetail(station: Station | null) {
  const uid = station?.source === 'waqi' ? getWaqiUid(station) : null;

  return useQuery<WaqiFeedDataDto>({
    queryKey: ['waqi-feed', uid],
    queryFn: ({ signal }) => waqiClient.getStationFeed(uid!, signal),
    refetchInterval: 60_000,
    enabled: uid !== null,
    staleTime: 5 * 60 * 1000,
  });
}

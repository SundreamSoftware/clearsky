import { useQueries } from '@tanstack/react-query';
import type { Station } from '../model/station.types';
import type { MapBounds } from './useGlobalStations';
import { giosClient } from '../api/giosClient';
import { mapAqiDto } from '../utils/airQualityIndexMapper';
import { giosTimestamp, isCurrentReading } from '../utils/dataValidity';
import type { AqiLevel } from '../utils/airQualityScale';

let activeRequests = 0;
const waiting: (() => void)[] = [];
async function loadIndex(id: string, signal: AbortSignal) {
  if (activeRequests >= 4)
    await new Promise<void>((resolve) => waiting.push(resolve));
  else activeRequests++;
  try {
    signal.throwIfAborted();
    return mapAqiDto(await giosClient.getAirQualityIndex(id, signal));
  } finally {
    const next = waiting.shift();
    if (next) next();
    else activeRequests--;
  }
}

export function useVisibleGiosStations(
  stations: Station[],
  bounds: MapBounds,
  enabled: boolean,
) {
  const visible = enabled
    ? stations.filter(
        (s) =>
          s.latitude >= bounds.minLat &&
          s.latitude <= bounds.maxLat &&
          s.longitude >= bounds.minLon &&
          s.longitude <= bounds.maxLon,
      )
    : [];
  const queries = useQueries({
    queries: visible.map((station) => ({
      queryKey: ['aqindex', station.id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        loadIndex(station.id, signal),
      staleTime: 5 * 60_000,
      refetchInterval: 5 * 60_000,
      retry: 1,
    })),
  });
  const current: Station[] = [];
  queries.forEach((query, index) => {
    const data = query.data;
    const observedAt = giosTimestamp(data?.sourceDataDate);
    if (
      data?.indexLevel != null &&
      Number.isInteger(data.indexLevel) &&
      data.indexLevel >= 0 &&
      data.indexLevel <= 5 &&
      isCurrentReading(observedAt)
    ) {
      current.push({
        ...visible[index],
        aqiLevel: data.indexLevel as AqiLevel,
        observedAt,
      });
    }
  });
  return {
    stations: current,
    isFetching: queries.some((q) => q.isFetching),
    failed: queries.filter((q) => q.isError).length,
  };
}
